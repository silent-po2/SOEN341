/*  
    Commands to initialize the database.
    Use these to create a local database if you need to experiment with changes. 
*/

create table user (
Id int not null auto_increment,
Email varchar(30),
FirstName varchar(30),
LastName varchar(30),
Password varchar(32),
Type enum('T', 'P') NOT NULL,
primary key (Id)
);


create table child (
StudentId int auto_increment primary key,
FirstName varchar(30),
LastName varchar(30)
);

create table isParent (
ParentId int,
StudentId int,
Relation enum('M', 'F'),
foreign key (ParentId) references user(Id),
foreign key (StudentId) references child(StudentId),
primary key (ParentId, StudentId)
);

-- create table isTeacher (
-- TeacherId int,
-- StudentId int,
-- foreign key (TeacherId) references user(Id),
-- foreign key (StudentId) references child(StudentId),
-- primary key (TeacherId, StudentId)
-- );

create table course ( 
CourseId varchar(10) primary key,
courseName varchar(30)
);

create table teaches (
TeacherId int,
CourseId varchar(30),
foreign key (TeacherId) references user(Id),
foreign key (CourseId) references course(CourseId),
primary key (TeacherId, CourseId)
);

create table isRegistered (
StudentId int,
CourseId varchar(10),
grade int,
foreign key (StudentId) references child(StudentId),
foreign key (CourseId) references course(CourseId),
primary key (StudentID, CourseId)
);

create table thread (
	PostId int unsigned primary key NOT NULL auto_increment,
    Post varchar(256),
    `From` int NOT NULL,
    `About` int NOT NULL,
    RepliedTo int unsigned default NULL,
	DT DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    foreign key (`From`) references user(Id),
    foreign key (`About`) references child(StudentId),
    foreign key (RepliedTo) references thread(PostId) ON DELETE CASCADE
);

create table chat (
	MsgId int primary key NOT NULL auto_increment,
    Msg varchar(256),
    `From` int NOT NULL,
    `To` int NOT NULL,
	DT DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    foreign key (`From`) references user(Id),
	foreign key (`To`) references user(Id)
);


