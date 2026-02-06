import { logger } from "../utils/logger.js";
import axios from "axios";

// ============================================
// INTEGRATION TYPES
// ============================================

interface IntegrationConfig {
  type: IntegrationType;
  apiKey?: string;
  accessToken?: string;
  refreshToken?: string;
  webhookUrl?: string;
  instanceUrl?: string;
  accountId?: string;
}

type IntegrationType =
  | "hubspot"
  | "salesforce"
  | "calendly"
  | "slack"
  | "zapier"
  | "google_calendar"
  | "outlook"
  | "mailchimp"
  | "sendgrid";

interface SyncResult {
  success: boolean;
  recordsCreated: number;
  recordsUpdated: number;
  errors: string[];
}

interface Lead {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  company: string;
  phone?: string;
  website?: string;
  industry?: string;
  status?: string;
  customFields?: Record<string, any>;
}

// ============================================
// HUBSPOT INTEGRATION
// ============================================

export class HubSpotIntegration {
  private accessToken: string;
  private baseUrl = "https://api.hubapi.com";

  constructor(config: IntegrationConfig) {
    this.accessToken = config.accessToken || "";
  }

  async syncLeads(leads: Lead[]): Promise<SyncResult> {
    const result: SyncResult = {
      success: true,
      recordsCreated: 0,
      recordsUpdated: 0,
      errors: [],
    };

    for (const lead of leads) {
      try {
        // Check if contact exists
        const existingContact = await this.findContactByEmail(lead.email);

        if (existingContact) {
          await this.updateContact(existingContact.id, lead);
          result.recordsUpdated++;
        } else {
          await this.createContact(lead);
          result.recordsCreated++;
        }
      } catch (error: any) {
        result.errors.push(`Failed to sync ${lead.email}: ${error.message}`);
        result.success = false;
      }
    }

    logger.info(
      `HubSpot sync complete: ${result.recordsCreated} created, ${result.recordsUpdated} updated`,
    );
    return result;
  }

  private async findContactByEmail(
    email: string,
  ): Promise<{ id: string } | null> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/crm/v3/objects/contacts/search`,
        {
          filterGroups: [
            {
              filters: [
                { propertyName: "email", operator: "EQ", value: email },
              ],
            },
          ],
        },
        { headers: { Authorization: `Bearer ${this.accessToken}` } },
      );
      return response.data.results[0] || null;
    } catch {
      return null;
    }
  }

  private async createContact(lead: Lead): Promise<void> {
    await axios.post(
      `${this.baseUrl}/crm/v3/objects/contacts`,
      {
        properties: {
          email: lead.email,
          firstname: lead.firstName,
          lastname: lead.lastName,
          company: lead.company,
          phone: lead.phone,
          website: lead.website,
          industry: lead.industry,
        },
      },
      { headers: { Authorization: `Bearer ${this.accessToken}` } },
    );
  }

  private async updateContact(contactId: string, lead: Lead): Promise<void> {
    await axios.patch(
      `${this.baseUrl}/crm/v3/objects/contacts/${contactId}`,
      {
        properties: {
          company: lead.company,
          phone: lead.phone,
          website: lead.website,
          industry: lead.industry,
        },
      },
      { headers: { Authorization: `Bearer ${this.accessToken}` } },
    );
  }

  async createDeal(data: {
    leadId: string;
    dealName: string;
    amount: number;
    stage: string;
    closeDate: string;
  }): Promise<string> {
    const response = await axios.post(
      `${this.baseUrl}/crm/v3/objects/deals`,
      {
        properties: {
          dealname: data.dealName,
          amount: data.amount.toString(),
          dealstage: data.stage,
          closedate: data.closeDate,
        },
      },
      { headers: { Authorization: `Bearer ${this.accessToken}` } },
    );
    return response.data.id;
  }
}

// ============================================
// SALESFORCE INTEGRATION
// ============================================

export class SalesforceIntegration {
  private accessToken: string;
  private instanceUrl: string;

  constructor(config: IntegrationConfig) {
    this.accessToken = config.accessToken || "";
    this.instanceUrl = config.instanceUrl || "";
  }

  async syncLeads(leads: Lead[]): Promise<SyncResult> {
    const result: SyncResult = {
      success: true,
      recordsCreated: 0,
      recordsUpdated: 0,
      errors: [],
    };

    for (const lead of leads) {
      try {
        const existingLead = await this.findLeadByEmail(lead.email);

        if (existingLead) {
          await this.updateLead(existingLead.Id, lead);
          result.recordsUpdated++;
        } else {
          await this.createLead(lead);
          result.recordsCreated++;
        }
      } catch (error: any) {
        result.errors.push(`Failed to sync ${lead.email}: ${error.message}`);
        result.success = false;
      }
    }

    logger.info(
      `Salesforce sync complete: ${result.recordsCreated} created, ${result.recordsUpdated} updated`,
    );
    return result;
  }

  private async findLeadByEmail(email: string): Promise<{ Id: string } | null> {
    try {
      const response = await axios.get(
        `${this.instanceUrl}/services/data/v57.0/query`,
        {
          params: { q: `SELECT Id FROM Lead WHERE Email = '${email}'` },
          headers: { Authorization: `Bearer ${this.accessToken}` },
        },
      );
      return response.data.records[0] || null;
    } catch {
      return null;
    }
  }

  private async createLead(lead: Lead): Promise<void> {
    await axios.post(
      `${this.instanceUrl}/services/data/v57.0/sobjects/Lead`,
      {
        Email: lead.email,
        FirstName: lead.firstName,
        LastName: lead.lastName || "Unknown",
        Company: lead.company,
        Phone: lead.phone,
        Website: lead.website,
        Industry: lead.industry,
      },
      { headers: { Authorization: `Bearer ${this.accessToken}` } },
    );
  }

  private async updateLead(leadId: string, lead: Lead): Promise<void> {
    await axios.patch(
      `${this.instanceUrl}/services/data/v57.0/sobjects/Lead/${leadId}`,
      {
        Company: lead.company,
        Phone: lead.phone,
        Website: lead.website,
        Industry: lead.industry,
      },
      { headers: { Authorization: `Bearer ${this.accessToken}` } },
    );
  }
}

// ============================================
// CALENDLY INTEGRATION
// ============================================

export class CalendlyIntegration {
  private accessToken: string;
  private baseUrl = "https://api.calendly.com";

  constructor(config: IntegrationConfig) {
    this.accessToken = config.accessToken || "";
  }

  async getSchedulingLink(eventTypeUri?: string): Promise<string> {
    const response = await axios.get(`${this.baseUrl}/users/me`, {
      headers: { Authorization: `Bearer ${this.accessToken}` },
    });
    return response.data.resource.scheduling_url;
  }

  async getUpcomingEvents(count: number = 10): Promise<any[]> {
    const userResponse = await axios.get(`${this.baseUrl}/users/me`, {
      headers: { Authorization: `Bearer ${this.accessToken}` },
    });

    const eventsResponse = await axios.get(`${this.baseUrl}/scheduled_events`, {
      params: {
        user: userResponse.data.resource.uri,
        count,
        status: "active",
        min_start_time: new Date().toISOString(),
      },
      headers: { Authorization: `Bearer ${this.accessToken}` },
    });

    return eventsResponse.data.collection;
  }

  async cancelEvent(eventUuid: string, reason: string): Promise<void> {
    await axios.post(
      `${this.baseUrl}/scheduled_events/${eventUuid}/cancellation`,
      { reason },
      { headers: { Authorization: `Bearer ${this.accessToken}` } },
    );
  }
}

// ============================================
// SLACK INTEGRATION
// ============================================

export class SlackIntegration {
  private webhookUrl: string;
  private accessToken?: string;

  constructor(config: IntegrationConfig) {
    this.webhookUrl = config.webhookUrl || "";
    this.accessToken = config.accessToken;
  }

  async sendNotification(message: {
    channel?: string;
    text: string;
    blocks?: any[];
  }): Promise<void> {
    if (this.webhookUrl) {
      await axios.post(this.webhookUrl, {
        text: message.text,
        blocks: message.blocks,
      });
    } else if (this.accessToken) {
      await axios.post(
        "https://slack.com/api/chat.postMessage",
        {
          channel: message.channel,
          text: message.text,
          blocks: message.blocks,
        },
        { headers: { Authorization: `Bearer ${this.accessToken}` } },
      );
    }
  }

  async sendLeadAlert(lead: Lead): Promise<void> {
    const blocks = [
      {
        type: "header",
        text: { type: "plain_text", text: "🎯 New Lead Alert", emoji: true },
      },
      {
        type: "section",
        fields: [
          { type: "mrkdwn", text: `*Company:*\n${lead.company}` },
          {
            type: "mrkdwn",
            text: `*Industry:*\n${lead.industry || "Unknown"}`,
          },
          {
            type: "mrkdwn",
            text: `*Contact:*\n${lead.firstName} ${lead.lastName}`,
          },
          { type: "mrkdwn", text: `*Email:*\n${lead.email}` },
        ],
      },
      {
        type: "actions",
        elements: [
          {
            type: "button",
            text: { type: "plain_text", text: "View Lead" },
            url: `https://app.atlasprime.com/leads/${lead.id}`,
            style: "primary",
          },
        ],
      },
    ];

    await this.sendNotification({
      text: `New lead: ${lead.company}`,
      blocks,
    });
  }

  async sendDealAlert(deal: {
    company: string;
    value: number;
    stage: string;
    repName: string;
  }): Promise<void> {
    const emoji =
      deal.stage === "won" ? "🎉" : deal.stage === "lost" ? "😔" : "📊";

    await this.sendNotification({
      text: `${emoji} Deal Update: ${deal.company} - $${deal.value.toLocaleString()} - ${deal.stage.toUpperCase()}`,
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `${emoji} *Deal Update*\n*${deal.company}*\nValue: $${deal.value.toLocaleString()}\nStage: ${deal.stage}\nRep: ${deal.repName}`,
          },
        },
      ],
    });
  }
}

// ============================================
// ZAPIER WEBHOOK INTEGRATION
// ============================================

export class ZapierIntegration {
  private webhookUrl: string;

  constructor(config: IntegrationConfig) {
    this.webhookUrl = config.webhookUrl || "";
  }

  async triggerZap(event: string, data: Record<string, any>): Promise<void> {
    await axios.post(this.webhookUrl, {
      event,
      timestamp: new Date().toISOString(),
      data,
    });
    logger.info(`Zapier webhook triggered: ${event}`);
  }

  async onNewLead(lead: Lead): Promise<void> {
    await this.triggerZap("new_lead", lead);
  }

  async onDealStageChange(deal: {
    id: string;
    stage: string;
    previousStage: string;
  }): Promise<void> {
    await this.triggerZap("deal_stage_change", deal);
  }

  async onTaskCompleted(task: {
    id: string;
    type: string;
    leadId: string;
  }): Promise<void> {
    await this.triggerZap("task_completed", task);
  }
}

// ============================================
// INTEGRATION HUB (FACTORY)
// ============================================

export class IntegrationHub {
  private integrations: Map<IntegrationType, any> = new Map();

  registerIntegration(type: IntegrationType, config: IntegrationConfig): void {
    switch (type) {
      case "hubspot":
        this.integrations.set(type, new HubSpotIntegration(config));
        break;
      case "salesforce":
        this.integrations.set(type, new SalesforceIntegration(config));
        break;
      case "calendly":
        this.integrations.set(type, new CalendlyIntegration(config));
        break;
      case "slack":
        this.integrations.set(type, new SlackIntegration(config));
        break;
      case "zapier":
        this.integrations.set(type, new ZapierIntegration(config));
        break;
      default:
        logger.warn(`Unknown integration type: ${type}`);
    }
    logger.info(`Registered integration: ${type}`);
  }

  getIntegration<T>(type: IntegrationType): T | null {
    return this.integrations.get(type) || null;
  }

  async syncLeadToAllCRMs(lead: Lead): Promise<Record<string, SyncResult>> {
    const results: Record<string, SyncResult> = {};

    const hubspot = this.getIntegration<HubSpotIntegration>("hubspot");
    if (hubspot) {
      results.hubspot = await hubspot.syncLeads([lead]);
    }

    const salesforce = this.getIntegration<SalesforceIntegration>("salesforce");
    if (salesforce) {
      results.salesforce = await salesforce.syncLeads([lead]);
    }

    return results;
  }

  async notifyAllChannels(
    message: string,
    data?: Record<string, any>,
  ): Promise<void> {
    const slack = this.getIntegration<SlackIntegration>("slack");
    if (slack) {
      await slack.sendNotification({ text: message });
    }

    const zapier = this.getIntegration<ZapierIntegration>("zapier");
    if (zapier && data) {
      await zapier.triggerZap("notification", { message, ...data });
    }
  }

  listActiveIntegrations(): IntegrationType[] {
    return Array.from(this.integrations.keys());
  }
}

export const integrationHub = new IntegrationHub();
