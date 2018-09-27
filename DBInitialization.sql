

/* Create a table called COURSE */
CREATE TABLE COURSE(courseID int PRIMARY KEY, grade int, courseName VARCHAR (30));

/* Create a table called CHILD */
CREATE TABLE CHILD(studentID INT NOT NULL AUTO_INCREMENT, firstName VARCHAR(20), lastName VARCHAR(20), PRIMARY KEY(studentID));

/* Create a table called USER*/
CREATE TABLE USER(Email VARCHAR(30) PRIMARY KEY, firstName VARCHAR(20), lastName VARCHAR(20), Login ENUM("Parent", "Teacher") NOT NULL);

/* Create a table called PARENT*/
CREATE TABLE PARENT(parentEmail VARCHAR(30) PRIMARY KEY, Login ENUM("Parent") NOT NULL, FOREIGN KEY (parentEmail,Login) REFERENCES USER(Email,Login));

/* Create a table called TEACHER*/
CREATE TABLE Teacher(teacherEmail VARCHAR(30) PRIMARY KEY, Login ENUM("Teacher") NOT NULL, FOREIGN KEY (teacherEmail, Login) REFERENCES USER(Email,Login));

/* Create a table called ISPARENT*/
CREATE TABLE ISPARENT(parentEmail VARCHAR(30) PRIMARY KEY, Relation ENUM("Mother", "Father") NOT NULL, studentID int, FOREIGN KEY (parentEmail) REFERENCES PARENT(parentEmail), FOREIGN KEY (studentID) REFERENCES CHILD(studentID));

/* Create a table called ISTEACHER*/
CREATE TABLE ISTEACHER(teacherEmail VARCHAR(30) PRIMARY KEY, studentID int, FOREIGN KEY (teacherEmail) REFERENCES TEACHER(teacherEmail), FOREIGN KEY (studentID) REFERENCES CHILD(studentID));

/* Create a table called TEACHES*/
CREATE TABLE TEACHES(teacherEmail VARCHAR(30) PRIMARY KEY, courseID int, FOREIGN KEY (teacherEmail) REFERENCES TEACHER(teacherEmail), FOREIGN KEY (courseID) REFERENCES COURSE(courseID));

/* Create a table called REGISTERED*/
CREATE TABLE REGISTERED(studentID int PRIMARY KEY, courseID int, FOREIGN KEY (studentID) REFERENCES CHILD(studentID), FOREIGN KEY (courseID) REFERENCES COURSE(courseID));

