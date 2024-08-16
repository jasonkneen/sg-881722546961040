import axios, { AxiosInstance } from 'axios';

class APIWrapper {
  private axiosInstance: AxiosInstance;
  private useMockData: boolean;

  constructor(baseURL: string, useMockData: boolean = false) {
    this.axiosInstance = axios.create({ baseURL });
    this.useMockData = useMockData;
  }

  // Add a new method to log messages
  logMessage(message: string) {
    const event = new CustomEvent('api-log', { detail: message });
    window.dispatchEvent(event);
  }

  // User API methods
  async getMobileUser(phoneNumber: string): Promise<GetMobileUserResponse> {
    this.logMessage(`Fetching user data for ${phoneNumber}`);
    if (this.useMockData) {
      const response = this.mockGetMobileUser(phoneNumber);
      this.logMessage(`Received user data for ${phoneNumber}`);
      return response;
    }
    const response = await this.axiosInstance.get(`/api/v1/User/Mobile/${phoneNumber}`);
    this.logMessage(`Received user data for ${phoneNumber}`);
    return response.data;
  }

  async createMobileUser(request: CreateMobileUserRequest): Promise<CreateMobileUserResponse> {
    if (this.useMockData) {
      return this.mockCreateMobileUser(request);
    }
    const response = await this.axiosInstance.post('/api/v1/User/Mobile', request);
    return response.data;
  }

  async deleteMobileUser(phoneNumber: string): Promise<void> {
    if (this.useMockData) {
      return this.mockDeleteMobileUser(phoneNumber);
    }
    await this.axiosInstance.delete(`/api/v1/User/Mobile/${phoneNumber}`);
  }

  // AlarmTransmissionConfiguration API methods
  async getAlarmTransmissionConfiguration(): Promise<GetAlarmTransmissionConfigurationResponse> {
    if (this.useMockData) {
      return this.mockGetAlarmTransmissionConfiguration();
    }
    const response = await this.axiosInstance.get('/api/v1/AlarmTransmissionConfiguration');
    return response.data;
  }

  async addAlarmTransmissionConfiguration(request: AddAlarmTransmissionConfigurationRequest): Promise<AddAlarmTransmissionConfigurationResponse> {
    if (this.useMockData) {
      return this.mockAddAlarmTransmissionConfiguration(request);
    }
    const response = await this.axiosInstance.post('/api/v1/AlarmTransmissionConfiguration', request);
    return response.data;
  }

  async updateAlarmTransmissionConfiguration(request: UpdateAlarmTransmissionConfigurationRequest): Promise<UpdateAlarmTransmissionConfigurationResponse> {
    if (this.useMockData) {
      return this.mockUpdateAlarmTransmissionConfiguration(request);
    }
    const response = await this.axiosInstance.put('/api/v1/AlarmTransmissionConfiguration', request);
    return response.data;
  }

  async deleteAlarmTransmissionConfiguration(): Promise<void> {
    if (this.useMockData) {
      return this.mockDeleteAlarmTransmissionConfiguration();
    }
    await this.axiosInstance.delete('/api/v1/AlarmTransmissionConfiguration');
  }

  // Mock implementations
  private mockGetMobileUser(phoneNumber: string): GetMobileUserResponse {
    this.logMessage(`Generating mock data for ${phoneNumber}`);
    return { phoneNumber };
  }

  private mockCreateMobileUser(request: CreateMobileUserRequest): CreateMobileUserResponse {
    return { phoneNumber: request.phoneNumber };
  }

  private mockDeleteMobileUser(phoneNumber: string): void {
    // No-op for mock
  }

  private mockGetAlarmTransmissionConfiguration(): GetAlarmTransmissionConfigurationResponse {
    return {
      primaryReceiver: "mock-receiver",
      compatibilityMode: true,
      version: "1",
      // Add other required fields with mock values
    };
  }

  private mockAddAlarmTransmissionConfiguration(request: AddAlarmTransmissionConfigurationRequest): AddAlarmTransmissionConfigurationResponse {
    return {
      ...request,
      version: "1",
    };
  }

  private mockUpdateAlarmTransmissionConfiguration(request: UpdateAlarmTransmissionConfigurationRequest): UpdateAlarmTransmissionConfigurationResponse {
    return request;
  }

  private mockDeleteAlarmTransmissionConfiguration(): void {
    // No-op for mock
  }
}

// Type definitions based on the provided schemas
interface GetMobileUserResponse {
  phoneNumber: string | null;
}

interface CreateMobileUserRequest {
  phoneNumber: string;
  attributes?: Record<string, any> | null;
}

interface CreateMobileUserResponse {
  phoneNumber: string | null;
}

interface AddAlarmTransmissionConfigurationRequest {
  primaryReceiver: string;
  secondaryReceiver?: string | null;
  smsPrimaryReceiver?: string | null;
  smsSecondaryReceiver?: string | null;
  connectionTimeoutMilliseconds?: number;
  smsDeliveryTimeoutMilliseconds?: number;
  normalLocationReportPeriodSeconds?: number;
  preAlarmVoiceCallPrimaryNumber?: string | null;
  preAlarmLocationReportPeriodSeconds?: number;
  alarmVoiceCallNumber?: string | null;
  alarmLocationReportPeriodSeconds?: number;
  allowSMSReverseCommands?: boolean;
  adminPasswordHash?: string | null;
  adminPasswordSalt?: string | null;
  requirePINOnStopAlarm?: boolean;
  requirePINOnExit?: boolean;
  compatibilityMode: boolean;
  forceSMSDeliveryNotification?: boolean;
}

interface AddAlarmTransmissionConfigurationResponse extends AddAlarmTransmissionConfigurationRequest {
  version: string;
}

type GetAlarmTransmissionConfigurationResponse = AddAlarmTransmissionConfigurationResponse;

interface UpdateAlarmTransmissionConfigurationRequest extends AddAlarmTransmissionConfigurationRequest {
  version: string;
}

type UpdateAlarmTransmissionConfigurationResponse = UpdateAlarmTransmissionConfigurationRequest;

export default APIWrapper;