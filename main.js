const { app, BrowserWindow, Menu, globalShortcut } = require("electron");
let mainWindow;
let aboutWindow;
//set enviroment
process.env.NODE_ENV = "development";
const isDev = process.env.NODE_ENV !== "production" ? true : false;
const isLinux = process.platform === "linux" ? true : false;
function createMainWindow() {
	mainWindow = new BrowserWindow({
		title: "ImageShrink",
		width: 1000,
		height: 600,
		icon: "./assets/icons/Icon_256x256.png",
		backgroundColor: "red",
		resizable: isDev,
	});

	mainWindow.loadURL(`file://${__dirname}/app/index.html`);
	//same way but different method
	//  mainWindow.loadFile('./app/index.html')
}

function createAboutWindow() {
	aboutWindow = new BrowserWindow({
		title: "ImageShrink",
		width: 300,
		height: 300,
		icon: "./assets/icons/Icon_256x256.png",
		backgroundColor: "white",
		resizable: false,
	});

	aboutWindow.loadURL(`file://${__dirname}/app/about.html`);
	//same way but different method
	//  mainWindow.loadFile('./app/index.html')
}

app.on("ready", () => {
	createMainWindow();
	const mainMenu = Menu.buildFromTemplate(menu);
	Menu.setApplicationMenu(mainMenu);

	globalShortcut.register("CmdOrCtrl+R", () => mainWindow.reload());
	globalShortcut.register("Ctrl+Shift+I", () => mainWindow.toggleDevTools());

	mainWindow.on("ready", () => (mainWindow = null));
});

const menu = [
	{
		role: "fileMenu",
	},
	...(isLinux
		? [
				{
					label: "Help",
					submenu: [
						{
							label: "About",
							click: createAboutWindow,
						},
					],
				},
		  ]
		: []),
	...(isDev
		? [
				{
					label: "Developer",
					submenu: [
						{ role: "reload" },
						{ role: "forcereload" },
						{ type: "separator" },
						{ role: "toggledevtools" },
					],
				},
		  ]
		: []),
];

app.on("window-all-closed", () => {
	if (process.platform !== "darwin") {
		app.quit();
	}
});

app.on("activate", () => {
	if (BrowserWindow.getAllWindows().length === 0) {
		createWindow();
	}
});

app.contextIsolation = true;
