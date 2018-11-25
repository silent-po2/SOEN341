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
ThreadNotif int default 0,
chatNotif int default 0,
groupChatNotif int default 0
primary key (Id)
);

create table thread (
	MsgId int primary key auto_increment,
    Message varchar(255),
    ImageName varchar(255),
    `Like` int default 0,
    Dislike int default 0,
    Sender varchar(100),
    SenderId int,
    foreign key (SenderId) references user(Id) on delete cascade
);

create table chat (
	MsgId int primary key NOT NULL auto_increment,
    Msg varchar(256),
    `From` int NOT NULL,
    `To` int NOT NULL,
	DT DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    foreign key (`From`) references user(Id) on delete cascade,
	foreign key (`To`) references user(Id) on delete cascade
);

create table groups (
	GroupId int primary key NOT NULL auto_increment,
    UserId int NOT NULL,
	title varchar(255),
    foreign key (UserId) references user(Id)
);

create table groupChat (
	GroupMsgId int primary key NOT NULL auto_increment,
    GroupMsg varchar(256),
    `From` int NOT NULL,
    GroupId int NOT NULL,
	DT DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    title varchar(255),
	foreign key (`From`) references user(Id) on delete cascade,
    foreign key (GroupId) references groups(GroupId) on delete cascade
);