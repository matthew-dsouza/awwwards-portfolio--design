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

import {ElemHideEmulation}
  from "adblockpluscore/lib/content/elemHideEmulation.js";

import {ignoreNoConnectionError} from "../errors.js";
import {startElementCollapsing, hideElement, unhideElement}
  from "./element-collapsing.js";
import {startOneClickAllowlisting} from "./allowlisting.js";
import {ElementHidingTracer} from "./element-hiding-tracer.js";
import {subscribeLinksEnabled, handleSubscribeLinks} from "./subscribe-links.js";

async function initContentFeatures() {
  if (subscribeLinksEnabled(window.location.href))
    handleSubscribeLinks();

  let response = await ignoreNoConnectionError(
    browser.runtime.sendMessage({type: "ewe:content-hello"})
  );

  if (!response)
    return;

  let tracer;
  if (response.tracedSelectors)
    tracer = new ElementHidingTracer(response.tracedSelectors);

  if (response.emulatedPatterns.length > 0) {
    let elemHideEmulation = new ElemHideEmulation((elements, filters) => {
      for (let element of elements)
        hideElement(element, response.cssProperties);

      if (tracer)
        tracer.log(filters);
    }, elements => {
      for (let element of elements)
        unhideElement(element);
    });
    elemHideEmulation.apply(response.emulatedPatterns);
  }
}

startElementCollapsing();
startOneClickAllowlisting();
initContentFeatures();
