import ADDRESS from "@salesforce/schema/Case.Address_Location__c";
import COUNTY from "@salesforce/schema/Case.County__c";
import HIGHWAY from "@salesforce/schema/Case.Highway__c";
import ID_FIELD from "@salesforce/schema/Case.Id";
import INDIAN from "@salesforce/schema/Case.Indian_Land__c";
import OWNER_AGENCY from "@salesforce/schema/Case.Land_Ownership__c";
import DD_LAT from "@salesforce/schema/Case.Latitude__c";
import DD_LONG from "@salesforce/schema/Case.Longitude__c";
import MILEMARKER from "@salesforce/schema/Case.Mile_Marker__c";
import CITY from "@salesforce/schema/Case.Nearest_Town_City__c";
import UTM_X from "@salesforce/schema/Case.Utm_E_X_6_dgts__c";
import UTM_Y from "@salesforce/schema/Case.Utm_N_Y_7_dgts__c";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import { getRecord, updateRecord } from "lightning/uiRecordApi";
import { api, LightningElement, wire } from "lwc";

export default class Spills extends LightningElement {
  utm_x;
  utm_y;
  @api recordId;
  @api isSandbox;
  @api instanceId;
  iframeId;
  sampleId = 1234;

  @wire(getRecord, { recordId: "$recordId", fields: [ID_FIELD, UTM_X, UTM_Y] })
  wiredRecord({ error, data }) {
    if (error) {
      let message = "Unknown error";
      if (Array.isArray(error.body)) {
        message = error.body.map((e) => e.message).join(", ");
      } else if (typeof error.body.message === "string") {
        message = error.body.message;
      }
      this.dispatchEvent(
        new ShowToastEvent({
          title: "Error loading contact",
          message,
          variant: "error"
        })
      );
    } else if (data) {
      console.log("wc(spills): wiredRecord data", data);
      this.utm_x = data.fields[UTM_X.fieldApiName].value;
      this.utm_y = data.fields[UTM_Y.fieldApiName].value;
    }
    console.log("instance " + this.instanceId);
    console.log("iframe " + this.iframeId);
  }

  get iframeSrc() {
    console.log("wc(spills): isSandbox", this.isSandbox);
    if (this.isSandbox) {
      return "https://spillsmap.dev.utah.gov?embedded=true"; // staging
    } else if (this.isSandbox === false) {
      return "https://deqspills.ugrc.utah.gov?embedded=true"; // prod
    }

    return null;
  }

  constructor() {
    console.log("wc(spills): constructor");
    super();
    this.iframeId = crypto.randomUUID();
    console.log("iframe " + this.iframeId);
  }

  connectedCallback() {
    console.log("wc(spills): connectedCallback");
    window.addEventListener("message", this.receiveMessage);
    console.log("instance " + this.instanceId);
    console.log("iframe " + this.iframeId);
  }

  disconnectedCallback() {
    window.removeEventListener("message", this.receiveMessage);
  }

  receiveMessage = (event) => {
    console.log("wc(spills): event from iframe:", event);
    console.log(JSON.stringify(event.data));

    if (event.origin !== this.iframeSrc) {
      console.warn(`wc: received message from unknown origin: ${event.origin}`);
      return;
    }

    const { data } = event;
    console.log("wc(spills): data from iframe:", data);
    console.log("wc(spills): data string " + JSON.stringify(data));

    if (data.iframeId !== this.iframeId) {
      console.log(
        "wc(spills): iframeId mismatch",
        data.iframeId,
        this.iframeId
      );
      return;
    }

    if (!data.UTM_X) {
      return;
    }
    const utmX = Math.round(data.UTM_X);
    const utmY = Math.round(data.UTM_Y);

    if (utmX === this.utm_x && utmY === this.utm_y) {
      console.log("wc(spills): no change in UTM_X or UTM_Y");
      return;
    }

    const fields = {
      [ID_FIELD.fieldApiName]: this.recordId,
      [ADDRESS.fieldApiName]: `${data.ADDRESS}, ${data.ZIP}`, // comes from widget text inputs
      [CITY.fieldApiName]: data.CITY,
      [COUNTY.fieldApiName]: data.COUNTY,
      [DD_LAT.fieldApiName]: data.DD_LAT.toString(),
      [DD_LONG.fieldApiName]: data.DD_LONG.toString(),
      [HIGHWAY.fieldApiName]: data.HIGHWAY, // comes from widget text input
      [INDIAN.fieldApiName]: data.INDIAN,
      [MILEMARKER.fieldApiName]: data.MILEMARKER, // comes from widget text input
      [OWNER_AGENCY.fieldApiName]: data.OWNER_AGENCY,
      [UTM_X.fieldApiName]: utmX.toString(),
      [UTM_Y.fieldApiName]: utmY.toString()
    };

    console.log(JSON.stringify(fields));

    updateRecord({ fields })
      .then(() => {
        console.log("record updating");
        console.log("wc(spills): record updated successfully");
      })
      .catch((error) => {
        console.log(JSON.stringify(error));
        this.dispatchEvent(
          new ShowToastEvent({
            title: "Error updating record",
            message: error.body.message,
            variant: "error"
          })
        );
      });
  };

  renderedCallback() {
    console.log("wc(spills): renderedCallback");
    console.log("instance " + this.instanceId);
    console.log("iframe " + this.iframeId);

    this.refs.iframe.addEventListener("load", () => {
      console.log("wc(spills): iframe loaded", this.utm_x, this.utm_y);
      console.log("wc(spills:) sending iframeId " + this.iframeId);
      this.refs.iframe.contentWindow.postMessage(
        {
          UTM_X: this.utm_x,
          UTM_Y: this.utm_y,
          iframeId: this.iframeId,
          targetOrigin: window.document.location.origin
        },
        this.iframeSrc
      );
    });
  }
}
