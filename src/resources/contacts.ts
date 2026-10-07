import { HttpClient } from '../http';
import {
  Contact, ContactStats, CreateContactParams, ImportContactRow, ImportContactsResult, ListContactsParams, PaginationMeta, UpdateContactParams,
} from '../types';

export class ContactsResource {
  constructor(private readonly http: HttpClient) {}

  /** People with a name, email or phone number, last-contacted first. */
  async list(params?: ListContactsParams): Promise<{ contacts: Contact[]; meta: PaginationMeta }> {
    return this.http.get('/v1/contacts', params as any);
  }

  /** Totals for the overview: everyone, new this week, leads, VIPs. */
  async getStats(): Promise<ContactStats> {
    return this.http.get('/v1/contacts/stats');
  }

  async get(id: number): Promise<Contact> {
    return this.http.get(`/v1/contacts/${id}`);
  }

  /** Adds a contact. Needs a name, email or phone. Throws an HttpError with status 409 if the email is already saved. */
  async create(params: CreateContactParams): Promise<{ contact: Contact }> {
    return this.http.post('/v1/contacts', params);
  }

  async update(id: number, params: UpdateContactParams): Promise<{ success: boolean }> {
    return this.http.patch(`/v1/contacts/${id}`, params);
  }

  /**
   * Imports up to 1,000 contacts per call. Rows whose email is already saved are skipped;
   * invalid rows are reported with their number instead of failing the whole import.
   */
  async import(rows: ImportContactRow[]): Promise<ImportContactsResult> {
    return this.http.post('/v1/contacts/import', { rows });
  }
}
