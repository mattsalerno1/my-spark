# Ascent Spark

A lightweight way to build and share UI prototypes. You get a homepage that lists all your projects; each one is a clickable prototype. You use your own copy on GitHub, run it locally, and it auto publishes it to the web so anyone with a link can view it.

**You’ll need:** a GitHub account, and Node + Yarn installed on your computer (or ask your dev team to set that up once).

---

## 1. Get it running on your computer

1. **Get your own copy.** On GitHub, open this repo and click **Fork**. That gives you a copy under your account.
2. **Open the project on your computer.** Use GitHub Desktop, Cursor, or another tool to “clone” or “open” that forked repo so you have a folder on your machine.
3. **Install and start it.** Open a terminal in that project folder and run:

   ```bash
   yarn install
   ```

---

## 2. Show it on your phone or another computer

To view the same prototype on your phone, tablet, or another computer on the same Wi‑Fi:

1. Start the dev server as usual

```
yarn dev:all
```

2. The terminal will show both a local address (e.g. `http://localhost:5173`) and a network address—the numbers in the network one depend on your Wi‑Fi, so yours may look different (e.g. `http://192.168.1.5:5173`).
3. Type the **network** address into the browser on your phone or other device. You can use this to share your prototype with anyone on the same network.

---

## 3. Setup GitHub Pages for external sharing.

**One-time setup in GitHub**

1. Open your forked repo on GitHub.
2. Go to **Settings** → **Pages**.
3. Under **Source**, choose **Deploy from a branch**.
4. **Branch:** choose `gh-pages`. **Folder:** choose **/ (root)**. Click **Save**.

**`yarn dev:all` commits your changes and deploys at the same time.**

6. After a minute or so, your live site will update. The link will look like:

   **`https://your-username.github.io/repo-name/`**

   Use the link **with the slash at the end** (e.g. `.../repo-name/`). If you don’t see your changes, wait a minute and try that full URL again.

---

## Adding new prototypes

New prototypes live in the **projects** folder. The **todo** project is a good example to copy: duplicate that folder, rename it, and adjust the content. If you use an AI or a developer, you can point them at this repo and the **projects/todo** example.
