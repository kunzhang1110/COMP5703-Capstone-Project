var sql = require('mssql');

//Create connection to database
var dbConfig = {
	server: "cp5703.database.windows.net", 
	database: "COMP5703", 
	user: "jun", 
	password: "COMP5703comp",
	// Since we're on Windows Azure, we need to set the following options
	options: {
			encrypt: true
	}
};
var pool = new sql.ConnectionPool(dbConfig);
pool.connect(function(err){
	if (err)
		console.log(err);
	console.log("Database connected");
});
var	request = new sql.Request(pool);

module.exports = request;