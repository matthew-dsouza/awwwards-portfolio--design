/*
 * This file is part of eyeo's Web Extension Ad Blocking Toolkit (EWE),
 * Copyright (C) 2006-present eyeo GmbH
 *
 * EWE is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License version 3 as
 * published by the Free Software Foundation.
 *
 * EWE is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with EWE.  If not, see <http://www.gnu.org/licenses/>.
 */

import browser from "webextension-polyfill";
import {ignoreNoConnectionError} from "../errors.js";

export class ElementHidingTracer {
  constructor(selectors) {
    this.selectors = new Map(selectors);

    this.observer = new MutationObserver(() => {
      this.observer.disconnect();
      setTimeout(() => this.trace(), 1000);
    });

    if (document.readyState == "loading")
      document.addEventListener("DOMContentLoaded", () => this.trace());
    else
      this.trace();
  }

  log(filters, selectors = []) {
    ignoreNoConnectionError(browser.runtime.sendMessage(
      {type: "ewe:trace-elem-hide", filters, selectors}
    ));
  }

  trace() {
    let filters = [];
    let selectors = [];

    for (let [selector, filter] of this.selectors) {
      if (document.querySelector(selector)) {
        this.selectors.delete(selector);
        if (filter)
          filters.push(filter);
        else
          selectors.push(selector);
      }
    }

    if (filters.length > 0 || selectors.length > 0)
      this.log(filters, selectors);

    this.observer.observe(document, {childList: true,
                                     attributes: true,
                                     subtree: true});
  }
}
