CREATE DATABASE employee_tracking;

USE employee_tracking;

CREATE TABLE departments (
    id INT(11) NOT NULL AUTO_INCREMENT,
    name VARCHAR(30) NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE roles (
    id INT(11) NOT NULL AUTO_INCREMENT,
    title VARCHAR(30),
    salary DECIMAL(30),
    department_id INT(11),
    PRIMARY KEY (id),
    FOREIGN KEY (department_id) REFERENCES departments(id)
);

CREATE TABLE employees (
    id INT (11) NOT NULL AUTO_INCREMENT,
    first_name VARCHAR(30) NOT NULL,
    last_name VARCHAR(30) NOT NULL,
    role_id INT(11) NOT NULL,
    manager_id INT(11),
    PRIMARY KEY (id),
    FOREIGN KEY (role_id) REFERENCES roles (id),
    FOREIGN KEY (manager_id) REFERENCES employees(id)
);

INSERT INTO departments (name)
VALUES ("Engineering");
INSERT INTO departments (name)
VALUES ("Engineering");
INSERT INTO departments (name)
VALUES ("Sales");

INSERT INTO roles (title, salary, department_id)
VALUES ("Engineer Lead", 100000.00, 1);
INSERT INTO roles (title, salary, department_id)
VALUES ("Engineer", 80000.00, 1);
INSERT INTO roles (title, salary, department_id)
VALUES ("Marketing Lead", 100000.00, 2);

INSERT INTO employees (first_name, last_name, role_id, manager_id)
VALUES ( "Jim", "Jones", 1, null);
INSERT INTO employees (first_name, last_name, role_id, manager_id)
VALUES ("Sarah", "Thompson", 2, 1);
INSERT INTO employees (first_name, last_name, role_id, manager_id)
VALUES ("Sam", "Smith", 3, null);



