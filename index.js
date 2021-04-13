const inquirer = require('inquirer');
const connection = require('./connection.js')

function initialPrompt() {
  inquirer.prompt([
    {
      name: 'initial',
      type: 'list',
      message: 'What would you like to do?',
      choices: ['View all Employees', 'View all Employees by Department', 'View all Employees by Role', 'Add Department', 'Add Role', 'Add Employee']
    },
  ])
    .then(function (data) {
      switch (data.initial) {
        case 'View all Employees':
          viewAllEmployees();
          break;

        case 'View all Employees by Department':
          setDeptArray();
          break;

        case 'View all Employees by Role':
          setRoleArray();
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
      connection.end();
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
      //FIX THIS
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
          connection.end();
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
          connection.end();
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
        if(res[index].manager_id === null){
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
        };
    });
}

initialPrompt();


