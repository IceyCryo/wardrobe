# Wardrobe Studio — beginner setup and user guide

This guide is written for first-time users. You do not need programming experience or previous knowledge of Terminal, PowerShell, or Command Prompt.

Choose the setup guide for your computer:

- [Windows setup](#windows-setup)
- [macOS setup](#macos-setup)
- [Using Wardrobe Studio](#using-wardrobe-studio)

# macOS setup

## What you need

- A Mac connected to the internet
- macOS 12 or newer
- About 1 GB of free disk space

## 1. Download the project as a ZIP

1. Open the webpage where the Wardrobe Studio source code is provided.
2. If it is a GitHub page, click the green **Code** button.
3. Click **Download ZIP**.
4. Wait for the download to finish. Safari normally saves it in your **Downloads** folder.

Do not open or edit individual files on the code webpage. Download the complete ZIP so all required files stay together.

## 2. Extract the ZIP

1. Open **Finder**.
2. Select **Downloads** in the Finder sidebar.
3. Find the downloaded `.zip` file.
4. Double-click the ZIP file once.
5. macOS creates a normal blue folder beside it. Its name may be `wardrobe`, `wardrobe-main`, or similar.
6. Open that folder and confirm that it contains:
   - `package.json`
   - `package-lock.json`
   - an `app` folder
   - `README.md`

Use the extracted blue folder in the following steps—not the `.zip` file. You may move the extracted folder somewhere convenient, but do not move individual files out of it.

## 3. Open Terminal

Open **Finder → Applications → Utilities → Terminal**, or press `Command + Space`, type `Terminal`, and press Return.

All commands below are entered in Terminal. Paste one command at a time, then press Return.

## 4. Install Homebrew

Homebrew installs developer tools safely from Terminal. Paste:

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

The installation can take several minutes. It may ask for your Mac login password. The password will not appear—not even as dots—while you type; this is normal. Type it and press Return.

At the end, carefully look for a **Next steps** section. Homebrew may print one or two commands beginning with `echo` and `eval`. Copy and run each command exactly as shown. These commands make `brew` available in new Terminal windows.

Then confirm Homebrew works:

```bash
brew --version
```

You should see a Homebrew version number.

If Terminal prints a version number, continue. If it prints `command not found`, close Terminal, reopen it, run the Homebrew **Next steps** commands again, and retry.

## 5. Install Node.js

Wardrobe Studio runs with Node.js. Install it using Homebrew:

```bash
brew install node
```

Confirm both Node.js and npm are available:

```bash
node --version
npm --version
```

Both commands must print version numbers before continuing.

## 6. Open the extracted project folder in Terminal

1. Type `cd` in Terminal.
2. Type one space after `cd`.
3. Drag the extracted blue project folder from Finder directly into the Terminal window.
4. Terminal inserts the folder’s complete path.
5. Press Return.

It will look similar to:

```bash
cd /Users/your-name/Downloads/wardrobe-main
```

Confirm that you are in the correct folder:

```bash
ls
```

You should see `package.json`, `package-lock.json`, `app`, and this `README.md`.

If those items are not listed, repeat this step and make sure you dragged the extracted folder containing `package.json`, not the ZIP or a parent folder.

## 7. Install the project packages

Run:

```bash
npm install
```

Keep Terminal open and wait until the command finishes and a new prompt appears. This can take a few minutes the first time. Warnings are usually informational; an actual failure ends with `npm ERR!`.

## 8. Launch Wardrobe Studio

Run:

```bash
npm run dev
```

Wait until Terminal shows **Ready** and an address beginning with `http://localhost`. Open Safari, Chrome, or Firefox and visit:

[http://localhost:3000](http://localhost:3000)

Keep this Terminal window open while using the website. Closing it stops the local website.

To stop the website, return to Terminal and press `Control + C`.

To launch it again later:

1. Open Terminal.
2. Type `cd` followed by a space.
3. Drag the extracted project folder into Terminal.
4. Press Return.
5. Run `npm run dev`.
6. Open the local address shown in Terminal.

# Windows setup

## What you need

- A Windows 10 or Windows 11 computer connected to the internet
- About 1 GB of free disk space
- Permission to install an application on the computer

You will use **PowerShell**, a program included with Windows that accepts typed commands. Do not worry if you have never used it: each command you need is shown below.

## 1. Download the project as a ZIP

1. Open the webpage where the Wardrobe Studio source code is provided.
2. If it is a GitHub page, select the green **Code** button.
3. Select **Download ZIP**.
4. Wait for the download to finish. It will normally appear in your **Downloads** folder.

Download the complete ZIP rather than individual files so that all required files stay together.

## 2. Extract the ZIP

1. Open **File Explorer** by selecting the yellow folder icon on the taskbar, or press `Windows key + E`.
2. Select **Downloads** on the left.
3. Find the downloaded `.zip` file.
4. Right-click the ZIP and select **Extract All...**.
5. Leave the suggested location unchanged and select **Extract**.
6. Windows opens the extracted folder. Its name may be `wardrobe`, `wardrobe-main`, or similar.
7. Open that folder and confirm that it contains:
   - `package.json`
   - `package-lock.json`
   - an `app` folder
   - `README.md`

Use this extracted folder in the following steps, not the ZIP file. If you see another folder with the same or a similar name inside it, open that folder and look again for `package.json`.

## 3. Install Node.js

Node.js is the program that runs Wardrobe Studio. `npm`, the tool that installs the project's required packages, is included with it.

1. Open [https://nodejs.org](https://nodejs.org) in your web browser.
2. Download the version marked **LTS** (Long Term Support). Do not choose the **Current** version.
3. Open the downloaded `.msi` installer. It will normally be at the top-right of your browser or in **Downloads**.
4. If Windows asks whether to allow the app to make changes, select **Yes**.
5. In the installer, select **Next**.
6. Accept the license agreement, then select **Next**.
7. Keep the suggested installation location and features. Continue selecting **Next**.
8. You do not need to select the option that automatically installs extra tools.
9. Select **Install**, wait for it to finish, and then select **Finish**.

## 4. Open the project folder in PowerShell

1. Return to the extracted project folder in File Explorer.
2. Make sure you are in the folder that contains `package.json`.
3. Click the address bar at the top of File Explorer. The folder location becomes highlighted.
4. Type `powershell` and press Enter.

A blue or black PowerShell window opens in the correct folder. You will see a line ending in `>` with a blinking cursor. That is where commands are entered.

Paste a command by right-clicking inside PowerShell or by pressing `Ctrl + V`. Press Enter after each command. Do not type the word `powershell` shown before some examples elsewhere on the internet.

## 5. Confirm that Node.js is installed

Enter these commands one at a time:

```powershell
node --version
npm.cmd --version
```

Each command should display a version number, such as `v22.x.x` and `10.x.x`. Your numbers may be different.

If either command says it is not recognized, close PowerShell, install Node.js using step 3, and then repeat step 4. If you installed Node.js while PowerShell was already open, simply closing and reopening PowerShell is often enough.

## 6. Install the project packages

Enter:

```powershell
npm.cmd install
```

Keep PowerShell open while it works. The first installation can take several minutes. It is finished when the line ending in `>` and the blinking cursor appear again.

Messages beginning with `npm WARN` are usually informational. If you see `npm ERR!`, read the [Windows troubleshooting](#windows-troubleshooting) section below.

## 7. Launch Wardrobe Studio

Enter:

```powershell
npm.cmd run dev
```

Wait until PowerShell shows **Ready** and an address beginning with `http://localhost`, normally:

[http://localhost:3000](http://localhost:3000)

Hold `Ctrl` and click the address in PowerShell, or open Edge, Chrome, or Firefox and type the address into its address bar.

Keep the PowerShell window open while using Wardrobe Studio. Closing it stops the local website. The website runs only on your computer; `localhost` does not mean that it has been published on the internet.

To stop Wardrobe Studio:

1. Return to PowerShell.
2. Press `Ctrl + C` once.
3. If PowerShell asks `Terminate batch job (Y/N)?`, type `Y` and press Enter.

## 8. Open Wardrobe Studio again later

You only need to install Node.js and run `npm.cmd install` once. The next time you want to use the app:

1. Open the extracted project folder in File Explorer.
2. Click the address bar, type `powershell`, and press Enter.
3. Enter `npm.cmd run dev`.
4. Wait for the local address to appear, then open it in your browser.

Do not double-click `package.json` or any of the code files to launch the app; start it with the command above.

## Using Wardrobe Studio

### Views

- **3D:** Orbit around the wardrobe and inspect its fittings.
- **Front:** See a straight-on elevation and resize the center run using its blue handles.
- **Plan:** Inspect the wardrobe footprint from above.
- **Fit:** Return the camera to a useful overview.
- **Left / Right:** Switch to left or right isometric views.

### Camera controls

- Left-drag in 3D: orbit
- Right-drag: pan
- Mouse wheel or trackpad scroll: zoom
- `W` / `S` in 3D: move the camera forward / backward
- `A` / `D` in 3D: move the camera left / right
- Quickly press `W` twice and hold the second press: move upward
- Quickly press `S` twice and hold the second press: move downward
- `Shift + W`: look upward without moving
- `Shift + S`: look downward without moving
- `Shift + A`: look left without moving
- `Shift + D`: look right without moving
- Click a section or fitting: select it

### Wardrobe footprint

Choose **Straight**, **L left**, **L right**, or **U shape**. The visibility buttons in the header independently show or hide the left, center, and right runs when those runs are available.

### Runs and sections

- Select a run section from the left sidebar.
- Use **Add** to insert a section after the selected section.
- Use the arrow buttons beside a section to change its order.
- Edit section width, clear height, and depth in the inspector.
- Change the complete selected run using **Run length**, **Run height**, and **Run depth**.
- Internal section dividers can be dragged to resize neighboring sections.

### Resizing with the cursor

Open **Front** view. Blue handles appear around the center run:

- Drag the left or right edge to change run width.
- Drag the top edge to change run height.
- Drag either top corner to change width and height together.

Sections scale proportionally and retain their minimum allowed width.

### Internal fittings

Select a section, then add shelves, clothes rails, drawers, wire baskets, cubbies, shoe shelves, mirrors, or LED profiles from the left sidebar.

For a selected fitting, the inspector can:

- Change horizontal and vertical position
- Change width, height, and depth
- Give each fitting its own color without changing other fittings
- Nudge the item using the arrow pad
- Move it to another section
- Align it left, horizontally centered, right, or vertically centered
- Configure drawer count, rows, columns, or mirror shape where applicable
- Duplicate or delete it

You can also drag fittings directly inside their section.

### Colors

Use **Wardrobe color** at the bottom of the inspector to color the currently selected run. The left, center, and right wardrobes keep independent colors.

When a fitting is selected, use **Element color** to color only that fitting. Other fittings and wardrobe runs are not changed.

### Keyboard shortcuts

Shortcuts work when a number field or menu is not focused.

| Shortcut | Action |
| --- | --- |
| Arrow keys | Move the selected fitting by 32 mm |
| Shift + Arrow keys | Move the selected fitting by 128 mm |
| W / A / S / D | Move the camera in 3D view |
| W twice / S twice | Hold the second press to move up / down |
| Shift + W / A / S / D | Look up, left, down, or right without moving |
| Delete or Backspace | Delete the selected fitting or section |
| Command + D (Mac) / Ctrl + D (Windows) | Duplicate the selected fitting |
| Command + Z (Mac) / Ctrl + Z (Windows) | Undo the last design change |
| Command + Shift + Z (Mac) / Ctrl + Shift + Z (Windows) | Redo the last undone change |
| Escape | Leave fitting selection and select its section |

Number fields have their own controls:

| Key | Action |
| --- | --- |
| Return | Apply the typed value |
| Escape | Restore the previous value |
| Up / Down Arrow | Increase or decrease by the field step |

You can temporarily erase a number or type a partial value. Limits are checked only when you press Return or leave the field.

### Export

Choose **Export drawing** to open the browser print dialog. Select **Save as PDF** to create a technical drawing PDF.

## macOS troubleshooting

### `brew: command not found`

Run the commands shown under **Next steps** at the end of the Homebrew installation, then close and reopen Terminal.

### `npm: command not found`

Run `brew install node`, close Terminal, reopen it, and try again.

### Port 3000 is already in use

Next.js normally offers another address such as `http://localhost:3001`. Open the exact address shown in Terminal.

### The page does not update

Refresh the browser with `Command + R`. If necessary, stop the server with `Control + C`, then run `npm run dev` again.

## Windows troubleshooting

### `node` or `npm.cmd` is not recognized

Close every PowerShell window and open a new one from the project folder. Try the command again. If it still fails, reinstall the **LTS** version of Node.js and keep the installer's default features selected.

### PowerShell says that running scripts is disabled

Use `npm.cmd` instead of `npm`. For example:

```powershell
npm.cmd install
npm.cmd run dev
```

These commands do not require you to change PowerShell's security settings.

### PowerShell cannot find `package.json`

PowerShell is open in the wrong folder. Close it, find the extracted folder containing `package.json` in File Explorer, click the address bar, type `powershell`, and press Enter. Then retry the command.

### Port 3000 is already in use

Next.js normally chooses another address, such as `http://localhost:3001`. Open the exact address displayed in PowerShell.

### Windows Firewall displays a security alert

If the alert appears immediately after `npm.cmd run dev`, allow **Private networks** only, then select **Allow access**. You do not need to allow Public networks to use the app on your own computer.

### The browser says that it cannot reach the page

Check that the PowerShell window is still open and that `npm.cmd run dev` is still running. Use the exact address displayed there. If needed, press `Ctrl + C`, run `npm.cmd run dev` again, and refresh the browser with `Ctrl + R`.

## Optional: start with an optimized production build

The normal `dev` command above is recommended while designing. If you need an optimized version instead, stop the running app with `Control + C` on Mac or `Ctrl + C` on Windows, then run the commands for your computer.

On macOS:

```bash
npm run build
npm start
```

On Windows:

```powershell
npm.cmd run build
npm.cmd start
```

Then open [http://localhost:3000](http://localhost:3000).
