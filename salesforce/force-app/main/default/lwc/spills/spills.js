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
import getJWTToken from "@salesforce/apex/FirebaseAuthProvider.getJWTToken";

const MESSAGE_TYPES = {
  DATA_SYNC: "data-sync",
  FLOWPATH_TOKEN_ERROR: "flowpath-token-error",
  FLOWPATH_TOKEN_REQUEST: "flowpath-token-request",
  FLOWPATH_TOKEN_RESPONSE: "flowpath-token-response"
};

export default class Spills extends LightningElement {
  utm_x;
  utm_y;
  @api recordId;
  @api isSandbox;
  @api instanceId;
  @api isReadOnly;
  iframeId;
  hasIframeLoadListener = false;
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
          title: "Error loading spill record data",
          message,
          variant: "error"
        })
      );
    } else if (data) {
      console.log("salesforce: salesforce data updated", data);
      this.utm_x = data.fields[UTM_X.fieldApiName].value;
      this.utm_y = data.fields[UTM_Y.fieldApiName].value;
    }

    console.log("instance " + this.instanceId);
    console.log("iframe " + this.iframeId);
  }

  get iframeOrigin() {
    return new URL(this.iframeSrc).origin;
  }

  get iframeSrc() {
    console.log("salesforce: isSandbox", this.isSandbox);
    if (this.isSandbox) {
      return `https://spillsmap.dev.utah.gov?embedded=true&readonly=${JSON.stringify(this.isReadOnly)}&flowpath=true`; // staging
    } else if (this.isSandbox === false) {
      return `https://spillsmap.deq.utah.gov?embedded=true&readonly=${JSON.stringify(this.isReadOnly)}&flowpath=true`; // prod
    } else {
      console.warn("salesforce: isSandbox is undefined");
    }

    return null;
  }

  constructor() {
    console.log("salesforce: constructor");
    super();
    this.iframeId = crypto.randomUUID();
  }

  connectedCallback() {
    console.log("salesforce: connectedCallback");
    window.addEventListener("message", this.receiveMessage);
    console.log("instance " + this.instanceId);
    console.log("iframe " + this.iframeId);
  }

  disconnectedCallback() {
    window.removeEventListener("message", this.receiveMessage);
  }

  receiveMessage = (event) => {
    if (event.origin !== this.iframeOrigin) {
      return;
    }

    console.log(
      "salesforce: event from iframe",
      JSON.stringify(event.data, null, 2)
    );

    const { iframeId, data, requestId, type } = event.data || {};

    if (iframeId !== this.iframeId) {
      console.log("salesforce: iframeId mismatch", iframeId, this.iframeId);
      return;
    }

    if (type === MESSAGE_TYPES.FLOWPATH_TOKEN_REQUEST) {
      void this.handleFlowpathTokenRequest(requestId);
      return;
    }

    if (type && type !== MESSAGE_TYPES.DATA_SYNC) {
      return;
    }

    if (!data.UTM_X) {
      return;
    }

    const utm_x = data.UTM_X.toString(); // salesforce stores the coordinate fields as strings ¯\_(ツ)_/¯
    const utm_y = data.UTM_Y.toString();
    if (utm_x === this.utm_x && utm_y === this.utm_y) {
      console.log("salesforce: no change in UTM_X or UTM_Y");
      return;
    }

    let address = null;
    if (data.ADDRESS && data.ZIP) {
      address = `${data.ADDRESS}, ${data.ZIP}`;
    } else if (data.ADDRESS) {
      address = data.ADDRESS;
    } else if (data.ZIP) {
      address = data.ZIP;
    }

    const fields = {
      [ID_FIELD.fieldApiName]: this.recordId,
      // make sure that the following properties stay in sync with the properties in website/src/utilities/defineLocation.ts
      [ADDRESS.fieldApiName]: address,
      [CITY.fieldApiName]: data.CITY,
      [COUNTY.fieldApiName]: data.COUNTY,
      [DD_LAT.fieldApiName]: data.DD_LAT.toString(),
      [DD_LONG.fieldApiName]: data.DD_LONG.toString(),
      [HIGHWAY.fieldApiName]: data.HIGHWAY, // comes from widget text input
      [INDIAN.fieldApiName]: data.INDIAN,
      [MILEMARKER.fieldApiName]: data.MILEMARKER, // comes from widget text input
      [OWNER_AGENCY.fieldApiName]: data.OWNER_AGENCY,
      [UTM_X.fieldApiName]: utm_x,
      [UTM_Y.fieldApiName]: utm_y
    };

    updateRecord({ fields })
      .then(() => {
        console.log("salesforce: record updated successfully");
      })
      .catch((error) => {
        console.error(JSON.stringify(error));
        this.dispatchEvent(
          new ShowToastEvent({
            title: "Error updating record",
            message: error.body.message,
            variant: "error"
          })
        );
      });
  };

  async handleFlowpathTokenRequest(requestId) {
    if (!requestId) {
      return;
    }

    try {
      const token = await getJWTToken({ caseId: this.recordId });

      this.postMessageToIFrame({
        requestId,
        token,
        type: MESSAGE_TYPES.FLOWPATH_TOKEN_RESPONSE
      });
    } catch (error) {
      console.error("salesforce: error getting flowpath token", error);

      this.postMessageToIFrame({
        error:
          error?.body?.message ||
          error?.message ||
          "Unable to retrieve a flow path token.",
        requestId,
        type: MESSAGE_TYPES.FLOWPATH_TOKEN_ERROR
      });
    }
  }

  postMessageToIFrame(message) {
    if (!this.refs?.iframe?.contentWindow) {
      console.warn("salesforce: iframe is not ready for postMessage");
      return;
    }

    this.refs.iframe.contentWindow.postMessage(
      {
        iframeId: this.iframeId,
        ...message
      },
      this.iframeOrigin
    );
  }

  sendCoordinatesToIFrame() {
    console.log(`salesforce: sending coordinates to iframe ${this.iframeId}`);

    try {
      this.postMessageToIFrame({
        data: {
          ID: this.recordId,
          UTM_X: parseInt(this.utm_x, 10),
          UTM_Y: parseInt(this.utm_y, 10)
        },
        type: MESSAGE_TYPES.DATA_SYNC
      });
    } catch (error) {
      console.error("salesforce: error sending message to iframe", error);
    }
  }

  renderedCallback() {
    console.log("salesforce: renderedCallback");
    console.log("instance " + this.instanceId);
    console.log("iframe " + this.iframeId);

    if (this.hasIframeLoadListener || !this.refs.iframe) {
      return;
    }

    this.hasIframeLoadListener = true;

    this.refs.iframe.addEventListener("load", () => {
      console.log("salesforce: iframe loaded", this.utm_x, this.utm_y);

      this.sendCoordinatesToIFrame();
    });
  }
}


/*
Apex class:
public with sharing class FirebaseAuthProvider {
    
    @AuraEnabled(cacheable=false)
    public static String getJWTToken(Id caseId) {
        Auth.JWT jwt = new Auth.JWT();
        jwt.setSub(UserInfo.getUserId()); 
        jwt.setAud('https://spillsmap.dev.utah.gov');
        jwt.setIss(UserInfo.getOrganizationId());

        Map<String, Object> claims = new Map<String, Object>();
        claims.put('authorizedCaseId', caseId);
        jwt.setAdditionalClaims(claims);

        jwt.setValidityLength(120); 

        Auth.JWS jws = new Auth.JWS(jwt, 'FirebaseMapCert');
        
        return jws.getCompactSerialization();
    }
}
*/