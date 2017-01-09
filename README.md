# paperless-office

##team
 - Joosens Marijn
 - Samyn Mathias
 - Driessen Joey

##Disclaimer
Dit project is nog steeds in alpha versie. Hierdoor werkt dit enkel op geteste devices/browsers.
Hierbij willen wij dan ook aangeven dat het enkel getest is met de volgende criteria:
 - Browser: Google Chrome
 - Linux server: Ubuntu v16.04.1
 - Express server: Node v7.2.1
 - Storage server: Blob Storage account (Azure)
 - Database: MongoDB v3.2.10

##Hoe kan je je eigen server opzetten
Als eerste heb je de benodigheden nodig die in de disclaimer staan. Dit betekent dus het opzetten van alle servers met de benodigde versies.
Voor de mongodb zal je een database nodig hebben met de naam `mydb`.
Mocht je de mongodb willen laten draaien zelfs wanneer de terminal is afgesloten gebruik dan volgend commando:
`sudo mongod --fork --logpath ~/mongodblogs/mongodb.log`


Vanaf dat gebeurt is zal je de gehele `master` repo moeten clonen op de server.
De code die nodig zal zijn voor de website/server zit allemaal in de src folder.
Wat je enkel nog nodig hebt zijn de credentials van het Azure account in de folder `paperless-office-backend` in het volgend formaat:

```
{
	"storageAccountName": "[Storage account name]",
	"primaryKey": "[Storage primary key]"
}

```
Alles zit ook al in een vaste structuur:
```
Joey/paperless-office/src/
├── paperless-office-backend
│   ├── backend
│   ├── config.json
│   ├── startupjob.conf
│   └── startupScript.sh
├── paperless-office-mobile
│   └── Paperlessoffice
└── paperless-office-site
    ├── build
    ├── Content
    ├── controllers.js
    ├── css
    ├── Files
    ├── fonts
    ├── images
    ├── index.html
    ├── node-server
    ├── npm-debug.log
    ├── packages.config
    ├── partials
    ├── pdfjs-dist-master
    ├── pdfjs-dist-master.zip
    ├── previewPDF.html
    ├── Scripts
    ├── services.js
    ├── web
    └── Web.config

```

Je gaat hierna naar de volgende folder:
`paperless-office-back-backend` en voert dan het volgende commando uit `sudo npm install` deze zal via de [`application.js`](https://github.com/xigolle/paperless-office/blob/master/src/paperless-office-backend/backend/package.json) file alle nodige packages downloaden.

Vanaf het moment dat dit gebeurt is ga je het commando `sudo npm start` moeten gebruiken.

Hierna kan je naar het IP of URL van de server gaan op poort 3000 om naar de website te gaan.
Dit zou er dan als volgt uitkunnen zien: `my-website.com:3000`
Of je kan het volgende commando gebruiken dat poort 80 verkeer redirect naar poort 3000:
`sudo iptables -t nat -A PREROUTING -i eth0 -p tcp --dport 80 -j REDIRECT --to-port 3000`

##opzetten storage account
Voor het opzetten van een storage account zal je eerste een Azure account moeten hebben.
Via de portal van Azure ga je het account moeten opzetten.
Je zal de file `server.json` nodig hebben in de folder `paperless-office-backend` en hier zullen de credentials van het storage account in moeten komen in volgende formaat:

```
{
	"storageAccountName": "[Storage account name]",
	"primaryKey": "[Storage primary key]"
}

```

