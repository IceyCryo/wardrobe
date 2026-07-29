# Wardrobe Studio — macOS setup guide

This guide is written for beginners. You do not need prior programming experience.

## What you need

- A Mac connected to the internet
- macOS 12 or newer
- About 1 GB of free disk space
- The Wardrobe Studio project folder

## 1. Open Terminal

Open **Finder → Applications → Utilities → Terminal**, or press `Command + Space`, type `Terminal`, and press Return.

All commands below are entered in Terminal. Paste one command at a time, then press Return.

## 2. Install Homebrew

Homebrew installs developer tools safely from Terminal. Paste:

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

The installer may ask for your Mac login password. The password will not appear while you type; this is normal. Press Return when finished.

At the end, Homebrew may display one or two commands under **Next steps**. Copy and run those commands before continuing. Then confirm Homebrew works:

```bash
brew --version
```

You should see a Homebrew version number.

## 3. Install Node.js

Wardrobe Studio runs with Node.js. Install it using Homebrew:

```bash
brew install node
```

Confirm both Node.js and npm are available:

```bash
node --version
npm --version
```

Both commands should print version numbers.

## 4. Open the project folder in Terminal

Type `cd`, add a space, then drag the **wardrobe** project folder from Finder into the Terminal window. Terminal inserts the correct path automatically. Press Return.

It will look similar to:

```bash
cd /Users/your-name/Downloads/wardrobe
```

Confirm that you are in the correct folder:

```bash
ls
```

You should see `package.json`, `package-lock.json`, `app`, and this `README.md`.

## 5. Install the project packages

Run:

```bash
npm install
```

This can take a few minutes the first time. Warnings are usually informational; an actual failure ends with `npm ERR!`.

## 6. Launch Wardrobe Studio

Run:

```bash
npm run dev
```

Wait until Terminal shows that the server is ready. Open a browser and visit:

[http://localhost:3000](http://localhost:3000)

Keep the Terminal window open while using the website.

To stop the website, return to Terminal and press `Control + C`. To launch it again later, open Terminal, enter the project folder with `cd`, and run `npm run dev`.

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
| Delete or Backspace | Delete the selected fitting or section |
| Command + D | Duplicate the selected fitting |
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

## Troubleshooting

### `brew: command not found`

Run the commands shown under **Next steps** at the end of the Homebrew installation, then close and reopen Terminal.

### `npm: command not found`

Run `brew install node`, close Terminal, reopen it, and try again.

### Port 3000 is already in use

Next.js normally offers another address such as `http://localhost:3001`. Open the exact address shown in Terminal.

### The page does not update

Refresh the browser with `Command + R`. If necessary, stop the server with `Control + C`, then run `npm run dev` again.

### Start with a production build

For a final optimized version, run:

```bash
npm run build
npm start
```

Then open [http://localhost:3000](http://localhost:3000).
