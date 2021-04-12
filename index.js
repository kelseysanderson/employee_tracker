const inquirer = require('inquirer');
const connection = require('./mysql.js')

//inquirer.. main file]

        .then(function(data) {
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
                addEmployee();
              break;
        }
  });
}

function viewAllEmployees(){
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
    .then(function(data) {
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

function viewEmployeesByRole(rolesArray){
  inquirer.prompt([
    {
    type: 'list',
    name: 'role',
    message: 'What role would you like to view?',
    choices: rolesArray,
    },])
    .then(function(data) {
      let role = data.role
      role = role.charAt(0).toUpperCase() + role.slice(1);

      console.log(role)
      connection.query(`
          SELECT *
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

function addDepartment(){
  inquirer.prompt([
    {
    type: 'input',
    name: 'newdept',
    message: 'What department would you like to add?',
    },])

    .then(function(data) {
      connection.query(
        'INSERT INTO departments (SET) ?',
        {
            name: data.newdept
        });
        var query = 'SELECT * FROM departments';
        connection.query(query, function(err, res) {
        if(err)throw err;
        console.log('Your department has been added!');
        console.table(res);
        })
  });
}

function addRole(){
  let deptArray = []
  connection.query(`
    SELECT name
    FROM departments`,
    (err, res) => {
      if (err) throw err;
      for (let index = 0; index < res.length; index++) {
        if (res[index] === res[++index]) continue;
        deptArray.push(res[index].name)
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
            choices: deptArray,
            },])
            .then(function(data) {

              connection.query(
                `INSERT INTO roles (title, salary, department_id) VALUES ('${data.title}', ${data.salary}, ANY (SELECT id FROM departments WHERE name = '${data.department}'))`,

                (err, res) => {
                  if (err) throw err;
                  console.table('added')
                  });
          });
    });
}
 
// function addEmployee() {
//   let employeeArray = []
//   connection.query(`
//     SELECT * FROM employees`,
//     (err, res) => {
//       console.log(res.length)
//       if (err) throw err;
//       for (let index = 0; index < res.length; index++) {
//         if (res[index] === res[++index]) continue;
//         console.log(res[index])
//         // employeeArray.push(res[index].first_name + " " + res[index].last_name)
//       }
//           inquirer.prompt([
//             {
//             type: 'input',
//             name: 'first_name',
//             message: 'What is the employee\'s first name?',
//             },
//             {
//             type: 'input',
//             name: 'last_name',
//             message: 'What is the employee\'s last name?',
//             },
//             {
//             type: 'input',
//             name: 'role',
//             message: 'What is the employee\'s role?',
//             },
//             {
//             type: 'list',
//             name: 'department',
//             message: 'Who is the employee\'s manager?',
//             choices: employeeArray,
//             },])
//             .then(function(data) {

//               connection.query(
//                 `INSERT INTO names (first_name, last_name, role_id, manager_id) VALUES ('${data.first_name}', ${data.last_name}, ANY (SELECT role_id FROM roles WHERE title = '${data.department}')ANY (SELECT manager_id FROM departments WHERE name = '${data.department}'))`,

//                 (err, res) => {
//                   if (err) throw err;
//                   console.table('added')
//                   });
//           });
//     });

// }

initialPrompt();


