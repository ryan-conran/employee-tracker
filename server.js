const inquirer = require("inquirer");
const path = require("path");
const mysql = require('mysql');

let connection = null;
let departments = [];
let roles = [];
let employees = [{fullName:"No Manager"}];

// Write code to use inquirer to gather information about the development team members,
// and to create objects for each team member (using the correct classes as blueprints!)

function promptMenu() {
    const mainMenu = [
        {
            type: 'list',
            message: 'What would you like to do?',
            name: 'menu',
            choices: ["Add Departnment", "Add Role", "Add Employee", "View Employees by Manager"]
        },
        {
            type: 'input',
            message: 'Enter department name',
            name: 'name',
            when: (answers) => answers.menu === "Add Departnment"
        },
        {
            type: 'input',
            message: 'Enter a role title',
            name: 'title',
            when: (answers) => answers.menu === "Add Role"
        },
        {
            type: 'input',
            message: 'Enter a role salary',
            name: 'salary',
            when: (answers) => answers.menu === "Add Role"
        },
        {
            type: 'list',
            message: 'Select a department',
            name: 'departmentName',
            choices: departments.map(d => d.name),
            when: (answers) => answers.menu === "Add Role"
        },
        {
            type: 'input',
            message: 'Enter an employee first name',
            name: 'firstName',
            when: (answers) => answers.menu === "Add Employee"
        },
        {
            type: 'input',
            message: 'Enter an employee last name',
            name: 'lastName',
            when: (answers) => answers.menu === "Add Employee"
        },
        {
            type: 'list',
            message: 'Select role',
            name: 'roleName',
            choices: roles.map(d => d.title),
            when: (answers) => answers.menu === "Add Employee"
        },
        {
            type: 'list',
            message: 'Select a manager',
            name: 'managerName',
            choices: employees.map(e => e.fullName),
            when: (answers) => answers.menu === "Add Employee"
        },
        {
            type: 'list',
            message: 'Select a manager',
            name: 'managerName',
            choices: employees.filter(e => e.manager != "No Manager").map(e => e.manager),
            when: (answers) => answers.menu === "View Employees by Manager"
        }

    ];
    // proimises after questions have been answered in terminal
    inquirer.prompt(mainMenu).then((answers) => {
        console.log(answers);

        if (answers.menu === "Add Departnment") {
            const department = {
                name: answers.name,
            };

            const query = `INSERT INTO department(name) VALUES('${department.name}')`;

            connection.query(query, function (err, result) {
                if (err) throw err;
                console.log("Department is inserted");
            });
        } else if (answers.menu === "Add Role") {
            const role = {
                title: answers.title,
                salary: answers.salary,
                departmentId: departments.filter(
                    (d) => d.name == answers.departmentName
                )[0].id,
            };

            const query = `INSERT INTO role(title, salary, department_id) VALUES('${role.title}', ${role.salary}, ${role.departmentId} )`;

            connection.query(query, function (err, result) {
                if (err) throw err;
                console.log("Role is inserted");
            });
        } else if (answers.menu == "Add Employee") {
            let managerId = 'NULL';

            if (answers.managerName != "No Manager") {
                managerId = employees.filter(e => e.fullName == answers.managerName)[0].id;
            }

            const employee = {
                firstName: answers.firstName,
                lastName: answers.lastName,
                roleId: roles.filter(
                    (d) => d.title == answers.roleName
                )[0].id,
                managerId: managerId
            };
            const query = `INSERT INTO employee(first_name, last_name, role_id, manager_id) VALUES('${employee.firstName}', '${employee.lastName}', ${employee.roleId}, ${managerId})`;

            connection.query(query, function (err, result) {
                if (err) throw err;
                console.log("Employee Created");
            });
        } else {
            console.log("Showing all employees");
            for(let i=0; i< employees.length; i++)
            {
                if (employees[i].fullName == answers.managerName) {
                    console.log(`Employee: ${employees[i].fullName}`);
                }
            }
        }

        run();
    });
}

function createDBConnection() {
    connection = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'Bridgehouse22!',
        database: 'employee_tracker'
    });

    connection.connect();
}

function run() {
    departments = [];
    connection.query("SELECT * FROM department", function (err, res) {
        for (var i = 0; i < res.length; i++) {
            const department = {
                id: res[i].id,
                name: res[i].name,
            }
            departments.push(department);
        }
        roles = [];
        connection.query("SELECT * FROM role", function (err, res) {
            for (var i = 0; i < res.length; i++) {
                const role = {
                    id: res[i].id,
                    title: res[i].title,
                }
                roles.push(role);
            }
            employees = [{fullName:"No Manager"}];
            connection.query("SELECT * FROM employee", function (err, res) {
                for (var i = 0; i < res.length; i++) {
                    const employee = {
                        id: res[i].id,
                        firstName: res[i].first_name,
                        lastName: res[i].last_name,
                        fullName: `${res[i].first_name} ${res[i].last_name}`,
                        managerId: res[i].manager_id
                    }
                    employees.push(employee);
                }

                //fill managers object

                for(let i=0; i< employees.length;i++) {
                    const manager = employees.filter(e => e.id == employees[i].managerId);
                    if (manager.length > 0) {
                        employees[i].manager = manager[0].fullName;
                    }
                }

                //console.log("employees",employees);
                promptMenu();
            });
        });
    });
}

createDBConnection();


run();
