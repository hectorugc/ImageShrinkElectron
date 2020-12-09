const path = require("path");
const os = require("os");

const {
	app,
	BrowserWindow,
	Menu,
	globalShortcut,
	ipcMain,
	shell,
} = require("electron");
const imagemin = require("imagemin");
const log = require("electron-log");
const imageminMozjpeg = require("imagemin-mozjpeg");
const imageminpngQuant = require("imagemin-pngquant");
const slash = require("slash");
const { default: imageminPngquant } = require("imagemin-pngquant");
let mainWindow;
let aboutWindow;
//set enviroment
process.env.NODE_ENV = "production";
const isDev = process.env.NODE_ENV !== "production" ? true : false;
const isLinux = process.platform === "linux" ? true : false;
function createMainWindow() {
	mainWindow = new BrowserWindow({
		title: "ImageShrink",
		width: isDev ? 800 : 500,
		height: 600,
		icon: "./assets/icons/Icon_256x256.png",
		backgroundColor: "red",
		resizable: isDev ? true : false,
		webPreferences: {
			nodeIntegration: true,
		},
	});
	if (isDev) {
		mainWindow.webContents.openDevTools();
	}

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

ipcMain.on("image:minimize", (e, options) => {
	options.dest = path.join(os.homedir(), "imageshrink");
	shrinkImage(options);
});

async function shrinkImage({ imgPath, quality, dest }) {
	try {
		const pngQuality = quality / 100;
		const files = await imagemin([slash(imgPath)], {
			destination: dest,
			plugins: [
				imageminMozjpeg({ quality }),
				imageminPngquant({
					quality: [pngQuality, pngQuality],
				}),
			],
		});
		//console.log(files);
		log.info(files);
		shell.openPath(dest);
		mainWindow.webContents.send("image:done");
	} catch (err) {
		//console.log(err);
		log.error(err);
	}
}
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
