const inquirer = require('inquirer');
const connection = require('./connection.js')

function initialPrompt() {
  inquirer.prompt([
    {
      name: 'initial',
      type: 'list',
      message: 'What would you like to do?',
      choices: ['View all Employees', 'View Employees by Department', 'View Employees by Role', 'View Employees by Manager', 'Add Department', 'Add Role', 'Add Employee', 'Update Employee Role', 'Update Employee Manager']
    },
  ])
    .then(function (data) {
      switch (data.initial) {
        case 'View all Employees':
          viewAllEmployees();
          break;

        case 'View Employees by Department':
          setDeptArray();
          break;

        case 'View Employees by Role':
          setRoleArray();
          break;

        case 'View Employees by Manager':
          setManagerArray();
          break;

        case 'Add Department':
          addDepartment();
          break;

        case 'Add Role':
          addRole();
          break;

        case 'Add Employee':
          setEmployeeArrays();
          break;

        case 'Update Employee Role':
          updateEmployeeRole();
          break;

        case 'Update Employee Manager':
          updateEmployeeManager();
          break;
      }
    });
}

function viewAllEmployees() {
  connection.query(
    `SELECT *
      FROM employee_tracking.employees
      JOIN employee_tracking.roles 
      ON employee_tracking.employees.role_id = employee_tracking.roles.id
      JOIN employee_tracking.departments
      ON employee_tracking.roles.department_id = employee_tracking.departments.id`,
    (err, res) => {
      if (err) throw err;
      console.table(res);
      initialPrompt()
      // connection.end();
    });
};

function setDeptArray() {
  let deptArray = []
  connection.query(`
    SELECT name
    FROM departments`,
    (err, res) => {
      if (err) throw err;
      for (let index = 0; index < res.length; index++) {
        deptArray.push(res[index].name)
      }
      viewEmployeesByDept(deptArray)
    });
}

function viewEmployeesByDept(deptArray) {
  inquirer.prompt([
    {
      type: 'list',
      name: 'dept',
      message: 'What department would you like to view?',
      choices: deptArray,
    },])
    .then(function (data) {
      let dept = data.dept
      dept = dept.charAt(0).toUpperCase() + dept.slice(1);
      connection.query(`
          SELECT *
          FROM employee_tracking.employees
          JOIN employee_tracking.roles 
          ON employee_tracking.employees.role_id = employee_tracking.roles.id
          JOIN employee_tracking.departments
          ON employee_tracking.roles.department_id = employee_tracking.departments.id
          WHERE name = "${dept}"`,
        (err, res) => {
          if (err) throw err;
          console.table(res);
          initialPrompt()
          // connection.end();
        });

    });
}

function setRoleArray() {
  let rolesArray = []
  connection.query(`
    SELECT title
    FROM roles`,
    (err, res) => {
      if (err) throw err;
      for (let index = 0; index < res.length; index++) {
        rolesArray.push(res[index].title)
      }
      viewEmployeesByRole(rolesArray)
    });
}

function viewEmployeesByRole(rolesArray) {
  inquirer.prompt([
    {
      type: 'list',
      name: 'role',
      message: 'What role would you like to view?',
      choices: rolesArray,
    },])
    .then(function (data) {
      let role = data.role
      role = role.charAt(0).toUpperCase() + role.slice(1);

      console.log(role)
      connection.query(
        ` SELECT *
          FROM employee_tracking.employees
          JOIN employee_tracking.roles 
          ON employee_tracking.employees.role_id = employee_tracking.roles.id
          JOIN employee_tracking.departments
          ON employee_tracking.roles.department_id = employee_tracking.departments.id
          WHERE title = "${role}"`,
        (err, res) => {
          if (err) throw err;
          console.table(res);
          initialPrompt()
        });

    });
}

function setManagerArray() {
  let managerArray = []
  connection.query(`
    SELECT *
    FROM employees`,
    (err, empResults) => {
      if (err) throw err;
      for (let index = 0; index < empResults.length; index++) {
        if (empResults[index].manager_id === null) {
          managerArray.push(empResults[index].first_name + " " + empResults[index].last_name)
        }
      }
      viewEmployeesByManager(managerArray, empResults);
    });
}

function viewEmployeesByManager(managerArray, empResults) {
  inquirer.prompt([
    {
      type: 'list',
      name: 'manager',
      message: 'Which manager would you like to view?',
      choices: managerArray,
    },])
    .then(function (data) {
      for (i = 0; i < empResults.length; i++) {
        if (data.manager.split(' ')[1] == empResults[i].last_name) {
          managerId = empResults[i].id;
        }
      }
      connection.query(
        ` SELECT *
          FROM employee_tracking.employees
          JOIN employee_tracking.roles 
          ON employee_tracking.employees.role_id = employee_tracking.roles.id
          JOIN employee_tracking.departments
          ON employee_tracking.roles.department_id = employee_tracking.departments.id
          WHERE manager_id = "${managerId}"`,
        (err, res) => {
          if (err) throw err;
          console.table(res);
          initialPrompt()
        });

    });
}

function addDepartment() {
  inquirer.prompt([
    {
      type: 'input',
      name: 'newdept',
      message: 'What department would you like to add?',
    },])

    .then(function (data) {
      connection.query(
        'INSERT INTO departments SET ?',
        {
          name: data.newdept
        });
      var query = 'SELECT * FROM departments';
      connection.query(query, function (err, res) {
        if (err) throw err;
        console.log('Your department has been added!');
        console.table(res);
        initialPrompt()
      })
    });
}

function addRole() {
  let deptArray = []
  let deptNameIdArray = []
  connection.query("SELECT * FROM departments",
    (err, res) => {
      if (err) throw err;
      for (let index = 0; index < res.length; index++) {
        deptArray.push(res[index].name)
        console.log(deptArray)
      }
      inquirer.prompt([
        {
          type: 'input',
          name: 'title',
          message: 'What role would you like to add?',
        },
        {
          type: 'input',
          name: 'salary',
          message: 'What is the salary of this role?',
        },
        {
          type: 'list',
          name: 'department',
          message: 'What department is this role apart of?',
          choices: deptArray
        },])
        .then(function (data) {
          let dept_id;
          for (i = 0; i < res.length; i++) {
            if (res[i].name == data.department) {
              dept_id = res[i].id;
            }
          }
          connection.query(
            "INSERT INTO roles SET ?",
            {
              title: data.title,
              salary: data.salary,
              department_id: dept_id
            },
            (err, res) => {
              if (err) throw err;
              initialPrompt()
            });
        });
    });
}

function setEmployeeArrays() {
  let managerArray = []
  let roleArray = []
  connection.query(`
      SELECT * FROM employees`,
    (err, res) => {
      if (err) throw err;
      for (let index = 0; index < res.length; index++) {
        if (res[index].manager_id === null) {
          managerArray.push(res[index].first_name + " " + res[index].last_name)
        }
      };
    });
  connection.query(`
        SELECT * FROM roles`,
    (err, res) => {
      if (err) throw err;
      for (let index = 0; index < res.length; index++) {
        roleArray.push(res[index].title)
      };
      addEmployee(managerArray, roleArray)
    });
};

function addEmployee(managerArray, roleArray) {
  inquirer.prompt([
    {
      type: 'input',
      name: 'first_name',
      message: 'What is the employee\'s first name?',
    },
    {
      type: 'input',
      name: 'last_name',
      message: 'What is the employee\'s last name?',
    },
    {
      type: 'list',
      name: 'role',
      message: 'What is the employee\'s role?',
      choices: roleArray,
    },
    {
      type: 'list',
      name: 'manager',
      message: 'Who is the employee\'s manager?',
      choices: managerArray,
    },])
    .then(function (data) {
      connection.query(
        `INSERT INTO employees(first_name, last_name, role_id, manager_id) VALUES(?, ?, 
          (SELECT id FROM roles WHERE title = ? ), 
          (SELECT id FROM (SELECT id FROM employees WHERE CONCAT(first_name," ",last_name) = ? ) AS tmptable))`, [data.first_name, data.last_name, data.role, data.manager]
      ),
        (err, res) => {
          if (err) throw err;
          initialPrompt()
        };
    });
}

function updateEmployeeRole() {
  let employeeArray = []
  let roleArray = []
  connection.query(
    `SELECT * FROM employees`,
    (err, empResults) => {
      connection.query(
        `SELECT * FROM roles`,
        (err, rolesResults) => {
          for (let index = 0; index < empResults.length; index++) {
            employeeArray.push(empResults[index].first_name + " " + empResults[index].last_name)
          }

          for (let index = 0; index < rolesResults.length; index++) {
            roleArray.push(rolesResults[index].title)
          }
          inquirer.prompt([
            {
              type: 'list',
              name: 'name',
              message: 'What is the employee\'s name?',
              choices: employeeArray,
            },
            {
              type: 'list',
              name: 'role',
              message: 'What is the employee\'s new role?',
              choices: roleArray,
            },
          ])
            .then(function (data) {
              let roleId;
              let employeeId;

              for (i = 0; i < rolesResults.length; i++) {
                if (data.role == rolesResults[i].title) {
                  roleId = rolesResults[i].id;
                }
              }

              for (i = 0; i < empResults.length; i++) {
                if (data.name.split(' ')[1] == empResults[i].last_name) {
                  employeeId = empResults[i].id;
                }
              }
              connection.query("UPDATE employees SET ? WHERE ? ",
                [{
                  role_id: roleId
                },
                {
                  id: employeeId
                }],
                function (err) {
                  if (err) throw err
                  initialPrompt()
                })
            });
        })
    });
}

function updateEmployeeManager() {
  let employeeArray = []
  let managerArray = []
  connection.query(
    `SELECT * FROM employees`,
    (err, empResults) => {
      for (let index = 0; index < empResults.length; index++) {
        employeeArray.push(empResults[index].first_name + " " + empResults[index].last_name)
      }
      for (let index = 0; index < empResults.length; index++) {
        if (empResults[index].manager_id === null) {
          managerArray.push(empResults[index].first_name + " " + empResults[index].last_name)
        }
      }
      console.log(employeeArray)
      console.log(managerArray)

      inquirer.prompt([
        {
          type: 'list',
          name: 'name',
          message: 'What is the employee\'s name?',
          choices: employeeArray,
        },
        {
          type: 'list',
          name: 'manager',
          message: 'Who is the employee\'s new manager?',
          choices: managerArray,
        },
      ])
        .then(function (data) {
          let roleId;
          let employeeId;

          for (i = 0; i < empResults.length; i++) {
            if (data.manager.split(' ')[1] == empResults[i].last_name) {
              managerId = empResults[i].id;
            }
          }

          for (i = 0; i < empResults.length; i++) {
            if (data.name.split(' ')[1] == empResults[i].last_name) {
              employeeId = empResults[i].id;
            }
          }

          connection.query("UPDATE employees SET ? WHERE ? ",
            [{
                manager_id: managerId
              },
            {
              id: employeeId
            },
          ],
            function (err) {
              if (err) throw err
              initialPrompt()
            })
        })
    });
}

initialPrompt();


