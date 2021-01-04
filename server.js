const inquirer = require("inquirer");
const path = require("path");
const mysql = require('mysql');

let connection = null;
let departments = [];

// Write code to use inquirer to gather information about the development team members,
// and to create objects for each team member (using the correct classes as blueprints!)

function promptMenu() {
    const mainMenu = [    
        { 
            type: 'list',
            message: 'What would you like to do?',
            name: 'menu',
            choices: ["Add Departnment", "Add Role", "Add Employee"]
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
            type: 'input',
            message: 'Enter an employee Role',
            name: 'roleId',
            when: (answers) => answers.menu === "Add Employee"
        },
        {
            type: 'input',
            message: 'Enter an employee Manager',
            name: 'managerId',
            when: (answers) => answers.menu === "Add Employee"
        },
    
    ]; 
    
    inquirer.prompt(mainMenu).then((answers) => {
    
        console.log(answers);

        if (answers.menu === "Add Departnment") {
            const department = {
                name: answers.name
            };

            const query = `INSERT INTO department(name) VALUES('${department.name}')`;

            connection.query(query, function (err, result ) {
                if (err) throw err;
                console.log("Department is inserted");
            });            
        } else if (answers.menu === "Add Role") {
            const role = {
                title: answers.title,
                salary: answers.salary,
                departmentId: departments.filter(d => d.name == answers.departmentName)[0].id
            };

            const query = `INSERT INTO role(title, salary, department_id) VALUES('${role.title}', ${role.salary}, ${role.departmentId} )`;

            connection.query(query, function (err, result ) {
                if (err) throw err;
                console.log("Role is inserted");
            }); 
        }
    
        run();
    });
}

// Change to my information to access database 
function createDBConnection() {
    connection = mysql.createConnection({
        host     : 'localhost',
        user     : 'root',
        password : 'password',
        database : 'employee_tracker'
      });
       
      connection.connect();
}

function run() {
    departments = [];
    connection.query("SELECT * FROM department", function(err, res) {
        for (var i = 0; i < res.length; i++) {
            const department = {
                id: res[i].id,
                name: res[i].name,
            }
            departments.push(department);
        }
        promptMenu();
      });
}

createDBConnection();


run();