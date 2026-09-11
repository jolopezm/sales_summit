import { mount } from "svelte";
import App from "./App.svelte";
// @ts-expect-error CSS files are handled by the bundler.
import "./css/app.css";

const target = document.getElementById("app");

if (!target) {
  throw new Error("Application root element was not found.");
}

mount(App, { target });
