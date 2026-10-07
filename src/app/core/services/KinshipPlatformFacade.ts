/**
 * Single entry point from the React UI to the Java backend (Facade + Singleton).
 * Every call goes to the KinshipServer REST API, which reads/writes MySQL through JDBC.
 */
const API_BASE: string = (import.meta as any).env?.VITE_API_URL ?? "/api";
const TOKEN_KEY = "kinship.token";
const USER_KEY = "kinship.user";

export class ApiError extends Error {
  constructor(public status: number, message: string, public code?: string) {
    super(message);
  }
}

export const UNAUTHORIZED_EVENT = "kinship:unauthorized";
export const SESSION_EVENT = "kinship:session";

export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

export class KinshipPlatformFacade {
  private static instance: KinshipPlatformFacade;
  private token: string | null = null;
  private user: any = null;

  private constructor() {
    try {
      this.token = localStorage.getItem(TOKEN_KEY);
      const stored = localStorage.getItem(USER_KEY);
      this.user = stored ? JSON.parse(stored) : null;
    } catch {
      this.token = null;
      this.user = null;
    }
  }

  public static getInstance(): KinshipPlatformFacade {
    if (!KinshipPlatformFacade.instance) {
      KinshipPlatformFacade.instance = new KinshipPlatformFacade();
    }
    return KinshipPlatformFacade.instance;
  }

  // ------------------------------------------------------------------ session

  public isLoggedIn(): boolean {
    return !!this.token;
  }

  public getCurrentUser(): any {
    return this.user;
  }

  private setSession(token: string, user: any) {
    this.token = token;
    this.setCurrentUser(user);
    try {
      localStorage.setItem(TOKEN_KEY, token);
    } catch {}
  }

  private setCurrentUser(user: any) {
    this.user = user;
    try {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } catch {}
    window.dispatchEvent(new CustomEvent(SESSION_EVENT));
  }

  public clearSession() {
    this.token = null;
    this.user = null;
    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    } catch {}
    window.dispatchEvent(new CustomEvent(SESSION_EVENT));
  }

  // ------------------------------------------------------------------ transport

  private async request<T = any>(method: HttpMethod, path: string, body?: unknown): Promise<T> {
    const headers: Record<string, string> = {};
    if (body !== undefined) headers["Content-Type"] = "application/json";
    if (this.token) headers["Authorization"] = `Bearer ${this.token}`;

    let res: Response;
    try {
      res = await fetch(`${API_BASE}${path}`, {
        method,
        headers,
        body: body !== undefined ? JSON.stringify(body) : undefined,
      });
    } catch {
      throw new ApiError(0, "Cannot reach the Java backend. Start it with: mvn compile exec:java");
    }

    let data: any = null;
    const text = await res.text();
    if (text) {
      try {
        data = JSON.parse(text);
      } catch {
        data = null;
      }
    }

    if (!res.ok) {
      if (res.status === 401 && this.token) {
        this.clearSession();
        window.dispatchEvent(new CustomEvent(UNAUTHORIZED_EVENT));
      }
      if (res.status >= 502 && data === null) {
        throw new ApiError(res.status, "Cannot reach the Java backend. Start it with: mvn compile exec:java");
      }
      throw new ApiError(res.status, data?.error ?? `Request failed (${res.status})`, data?.code);
    }
    return data as T;
  }

  // ------------------------------------------------------------------ auth

  public async login(email: string, password: string) {
    const data = await this.request("POST", "/auth/login", { email, password });
    this.setSession(data.token, data.user);
    return data.user;
  }

  public async register(name: string, email: string, password: string) {
    const data = await this.request("POST", "/auth/register", { name, email, password });
    this.setSession(data.token, data.user);
    return data.user;
  }

  public async googleSignIn() {
    const data = await this.request("POST", "/auth/google");
    this.setSession(data.token, data.user);
    return data.user;
  }

  public async logout() {
    try {
      await this.request("POST", "/auth/logout");
    } finally {
      this.clearSession();
    }
  }

  public async refreshCurrentUser() {
    const me = await this.request("GET", "/auth/me");
    this.setCurrentUser(me);
    return me;
  }

  // ------------------------------------------------------------------ feed

  public getFeedPostsAsync() {
    return this.request<any[]>("GET", "/feed");
  }

  public createPost(content: string, type: "image" | "video" | "collab" = "image", mediaUrl?: string) {
    return this.request("POST", "/feed", { content, type, mediaUrl });
  }

  public deletePost(id: number) {
    return this.request("DELETE", `/feed/${id}`);
  }

  public likePost(id: number) {
    return this.request<{ liked: boolean; likes: number }>("POST", `/feed/${id}/like`);
  }

  public getComments(id: number) {
    return this.request<any[]>("GET", `/feed/${id}/comments`);
  }

  public addComment(id: number, content: string) {
    return this.request("POST", `/feed/${id}/comments`, { content });
  }

  public sharePost(id: number) {
    return this.request<{ shares: number }>("POST", `/feed/${id}/share`);
  }

  // ------------------------------------------------------------------ creators

  public getCreatorsAsync(query?: string, talent?: string) {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (talent) params.set("talent", talent);
    const qs = params.toString();
    return this.request<any[]>("GET", `/creators${qs ? `?${qs}` : ""}`);
  }

  public getTrendingCreators() {
    return this.request<any[]>("GET", "/creators/trending");
  }

  public getRecommendedCreators() {
    return this.request<any[]>("GET", "/creators/recommended");
  }

  public getTalentStats() {
    return this.request<Record<string, number>>("GET", "/creators/talents");
  }

  public getCreator(id: number) {
    return this.request("GET", `/creators/${id}`);
  }

  public getCreatorPosts(id: number) {
    return this.request<any[]>("GET", `/creators/${id}/posts`);
  }

  public followUser(id: number) {
    return this.request<{ following: boolean; followers: number }>("POST", `/creators/${id}/follow`);
  }

  public async updateProfile(fields: { name?: string; bio?: string; location?: string; image?: string }) {
    const user = await this.request("PUT", "/users/me", fields);
    this.setCurrentUser({ ...this.user, ...user });
    return user;
  }

  public async updateTalents(talents: string[]) {
    const user = await this.request("PUT", "/users/me/talents", { talents });
    this.setCurrentUser({ ...this.user, ...user });
    return user;
  }

  // ------------------------------------------------------------------ opportunities

  public getOpportunitiesAsync(type?: string) {
    return this.request<any[]>("GET", `/opportunities${type && type !== "All" ? `?type=${encodeURIComponent(type)}` : ""}`);
  }

  public applyToOpportunity(id: number) {
    return this.request<{ applied: boolean; alreadyApplied: boolean; applicants: number }>(
      "POST",
      `/opportunities/${id}/apply`
    );
  }

  // ------------------------------------------------------------------ notifications

  public getNotifications() {
    return this.request<{ unread: number; items: any[] }>("GET", "/notifications");
  }

  public markAllNotificationsRead() {
    return this.request("POST", "/notifications/read-all");
  }

  public markNotificationRead(id: number) {
    return this.request("POST", `/notifications/${id}/read`);
  }

  // ------------------------------------------------------------------ messages

  public getConversations() {
    return this.request<any[]>("GET", "/messages");
  }

  public getThread(userId: number) {
    return this.request<{ user: any; messages: any[] }>("GET", `/messages/${userId}`);
  }

  public sendMessage(userId: number, content: string) {
    return this.request("POST", `/messages/${userId}`, { content });
  }

  // ------------------------------------------------------------------ collaborations

  public getCollaborations() {
    return this.request<{ requests: any[]; active: any[] }>("GET", "/collaborations");
  }

  public createCollaboration(title: string, description: string, talents: string[], deadline: string) {
    return this.request("POST", "/collaborations", { title, description, talents, deadline });
  }

  public sendCollaborationRequest(toUserId: number, project: string, message: string) {
    return this.request("POST", "/collaborations/requests", { toUserId, project, message });
  }

  public respondToCollaborationRequest(id: number, accept: boolean) {
    return this.request("POST", `/collaborations/requests/${id}/${accept ? "accept" : "decline"}`);
  }

  public updateCollaborationProgress(id: number, progress: number) {
    return this.request("PUT", `/collaborations/${id}/progress`, { progress });
  }

  // ------------------------------------------------------------------ system

  public getSystemStats() {
    return this.request("GET", "/system/stats");
  }

  public async checkJavaBackendStatus(): Promise<boolean> {
    try {
      await this.request("GET", "/system/health");
      return true;
    } catch {
      return false;
    }
  }
}

export const api = KinshipPlatformFacade.getInstance();

/** Message for a failed call, suitable for a toast. */
export function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : "Something went wrong";
}
