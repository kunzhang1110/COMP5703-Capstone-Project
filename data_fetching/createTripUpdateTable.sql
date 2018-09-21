create table real_time_test(
	entity_id nvarchar(50) not null,
	timestamp int not null ,
	route_id nvarchar(50) not null,
	trip_id nvarchar(50) not null,
	start_time datetime2(7) null,
	start_date nvarchar(50) not null,
	trip_schedule_relationship int null,
	stop_id  nvarchar(50)  not null,
	stop_sequence int not null,
	arrival_delay int null,
	arrival_time bigint null,
	departure_delay bigint null,
	departure_time bigint not null,
	vehicle_id nvarchar(50)  null,
	stop_schedule_relationship int null
)
