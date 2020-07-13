# Application Setup

1. Requirements:
	IIS
	MySQL
	NodeJS
	The following NodeJS packages:
		formidable
		mysql
		express
		express-json
		body-parser
		uuid
		
2. Set up IIS to the index.html path
3. Update the Testflow/Client/settings.json file
	Set the serverPath to the name of the server url
3. Update the Testflow/Server/settings.json
	Update the database tag to include your mysql authentication info
	Set the serverPath to the name of the server url