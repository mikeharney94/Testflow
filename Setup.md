# Application Setup

* Requirements:
	* IIS
	* MySQL
	* NodeJS
	* The following NodeJS packages:
		* formidable
		* mysql
		* express
		* express-json
		* body-parser
		* uuid
		
* Create an IIS application pointing to the index.html physical path
* Update the Testflow/Client/settings.json file
	* Set the serverPath to the name of the server url
* Update the Testflow/Server/settings.json
	* Update the database tag to include your mysql authentication information
	* Set the serverPath to the name of the server url
