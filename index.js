const express = require("express");
const fs = require("fs");
const puppeteer = require("puppeteer");
const path = require("path");
require("dotenv").config();

const app = express();

// Initialize the browser outside of the route handlers
var browser;
var page;

(async () => {
  browser = await puppeteer.launch({
    args: [
      "--disable-setuid-sandbox",
      "--no-sandbox",
      "--single-process",
      "--no-zygote",
    ],

    executablePath:
      process.env.NODE_ENV === "production"
        ? process.env.PUPPETEER_EXECUTABLE_PATH
        : puppeteer.executablePath(),
    headless: true,
  });
  page = await browser.newPage();
})();

app.get("/qr-code", async (req, res) => {
  console.log("called");
  try {
    await page.goto("https://web.whatsapp.com");

    // Wait for QR code to appear
    // await page.waitForSelector(".W3myC");
    await new Promise((resolve) => setTimeout(resolve, 30000));
    // await page.waitForNavigation();

    const qrCodeUrl = await page.evaluate(() => {
      const qrCodeElement = document.querySelector("canvas");
      return qrCodeElement.toDataURL();
    });

    // console.log("\n\n", qrCodeUrl, "\n\n");

    res.send(qrCodeUrl);
    // await page.screenshot({ path: "./screenshot.png" });

    // const filePath = path.join(__dirname, "screenshot.png");

    // // Check if the file exists
    // fs.access(filePath, fs.constants.F_OK, (err) => {
    //   if (err) {
    //     console.error(err);
    //     return res.status(404).send("File not found");
    //   }

    //   // Stream the file to the response
    //   const stream = fs.createReadStream(filePath);
    //   stream.pipe(res);
    // });
  } catch (error) {
    console.log(error, "some error occurred");
    res.status(500).send("Internal Server Error");
  }
});
app.get("/close", async (req, res) => {
  await browser.close(0);
});

app.get("/sms", async (req, res) => {
  let { msg, to } = req.query;
  console.log(to, msg);
  try {
    // const page = await browser.newPage();
    // await page.goto("https://web.whatsapp.com");

    await page.click(".iq0m558w");

    // Type recipient's name

    await page.waitForSelector("._2vDPL");
    await page.type("._2vDPL", to);
    // await page.waitForTimeout(3000); // Add a delay for the search results to appear

    //   // Click on the chat
    //   await page.waitForSelector("._8nE1Y");
    //   await page.click("._8nE1Y");

    await page.keyboard.press("Enter");
    await new Promise((resolve) => setTimeout(resolve, 5000));

    // await page.waitForSelector("._3Uu1_");
    await page.type("._3Uu1_", msg);

    await page.keyboard.press("Enter");

    res.send("Done");

    // Handle /hello route logic here
  } catch (error) {
    console.log(error, "some error occurred");
    res.status(500).send("Internal Server Error");
  }
});

app.listen(1000 || process.env.PORT, () => {
  console.log("Server is running on port 1000");
});
