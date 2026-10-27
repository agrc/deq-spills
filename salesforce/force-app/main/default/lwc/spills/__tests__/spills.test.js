jest.mock(
  "@salesforce/apex/FirebaseAuthProvider.getJWTToken",
  () => ({
    default: jest.fn()
  }),
  { virtual: true }
);

import getJWTToken from "@salesforce/apex/FirebaseAuthProvider.getJWTToken";
import Spills from "c/spills";
import { getRecord } from "lightning/uiRecordApi";
import { createElement } from "lwc";

const flushPromises = async () => {
  await Promise.resolve();
  await Promise.resolve();
};

describe("c-spills", () => {
  const mockedValue = "mocked-value";

  beforeAll(() => {
    delete window.crypto;
    window.crypto = {
      randomUUID: jest.fn(() => mockedValue)
    };
  });

  beforeEach(() => {
    jest.spyOn(console, "log").mockImplementation(() => {});
    jest.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();

    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
  });

  function createSpills() {
    const element = createElement("c-spills", {
      is: Spills
    });

    element.isSandbox = true;
    element.recordId = "500000000000001";
    document.body.appendChild(element);

    return element;
  }

  it("requests a token and posts it back to the iframe", async () => {
    const postMessage = jest.fn();
    getJWTToken.mockResolvedValue("jwt-token");

    const element = createSpills();
    Object.defineProperty(
      element.shadowRoot.querySelector("iframe"),
      "contentWindow",
      {
        configurable: true,
        value: { postMessage }
      }
    );

    window.dispatchEvent(
      new MessageEvent("message", {
        data: {
          iframeId: mockedValue,
          requestId: "request-1",
          type: "flowpath-token-request"
        },
        origin: "https://spillsmap.dev.utah.gov"
      })
    );

    await flushPromises();

    expect(getJWTToken).toHaveBeenCalledWith({ caseId: "500000000000001" });
    expect(postMessage).toHaveBeenCalledWith(
      {
        iframeId: mockedValue,
        requestId: "request-1",
        token: "jwt-token",
        type: "flowpath-token-response"
      },
      "https://spillsmap.dev.utah.gov"
    );
  });

  it("posts an error response when token retrieval fails", async () => {
    const consoleError = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});
    const postMessage = jest.fn();
    getJWTToken.mockRejectedValue({ body: { message: "Token unavailable" } });

    const element = createSpills();
    Object.defineProperty(
      element.shadowRoot.querySelector("iframe"),
      "contentWindow",
      {
        configurable: true,
        value: { postMessage }
      }
    );

    window.dispatchEvent(
      new MessageEvent("message", {
        data: {
          iframeId: mockedValue,
          requestId: "request-1",
          type: "flowpath-token-request"
        },
        origin: "https://spillsmap.dev.utah.gov"
      })
    );

    await flushPromises();

    expect(postMessage).toHaveBeenCalledWith(
      {
        error: "Token unavailable",
        iframeId: mockedValue,
        requestId: "request-1",
        type: "flowpath-token-error"
      },
      "https://spillsmap.dev.utah.gov"
    );
    expect(consoleError).toHaveBeenCalled();
  });

  it("ignores token requests from unexpected origins or iframe ids", async () => {
    const postMessage = jest.fn();

    const element = createSpills();
    Object.defineProperty(
      element.shadowRoot.querySelector("iframe"),
      "contentWindow",
      {
        configurable: true,
        value: { postMessage }
      }
    );

    window.dispatchEvent(
      new MessageEvent("message", {
        data: {
          iframeId: mockedValue,
          requestId: "request-1",
          type: "flowpath-token-request"
        },
        origin: "https://example.com"
      })
    );
    window.dispatchEvent(
      new MessageEvent("message", {
        data: {
          iframeId: "different-iframe",
          requestId: "request-2",
          type: "flowpath-token-request"
        },
        origin: "https://spillsmap.dev.utah.gov"
      })
    );

    await flushPromises();

    expect(getJWTToken).not.toHaveBeenCalled();
    expect(postMessage).not.toHaveBeenCalled();
  });

  it("sends NEAREST_WATERBODY_ID along with the coordinates to the iframe", async () => {
    const postMessage = jest.fn();
    const element = createSpills();
    const iframe = element.shadowRoot.querySelector("iframe");
    Object.defineProperty(iframe, "contentWindow", {
      configurable: true,
      value: { postMessage }
    });

    getRecord.emit({
      fields: {
        Utm_E_X_6_dgts__c: { value: "420304" },
        Utm_N_Y_7_dgts__c: { value: "4510276" },
        NearestWaterbodyID__c: { value: "stream:83629887" }
      }
    });
    await flushPromises();

    iframe.dispatchEvent(new Event("load"));

    expect(postMessage).toHaveBeenCalledWith(
      {
        iframeId: mockedValue,
        data: {
          ID: "500000000000001",
          UTM_X: 420304,
          UTM_Y: 4510276,
          NEAREST_WATERBODY_ID: "stream:83629887"
        },
        type: "data-sync"
      },
      "https://spillsmap.dev.utah.gov"
    );
  });
});
