'use strict';

import { TodoView } from './view.js';
import { TodoController } from "./controller.js";

document.addEventListener('DOMContentLoaded', () => {
	TodoView.init();
	TodoController.init();
});