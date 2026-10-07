const JAVA_BACKEND_URL = "http://localhost:8080/api";

export class KinshipPlatformFacade {
  private static instance: KinshipPlatformFacade;
  private isJavaBackendLive: boolean = false;

  private constructor() {
    this.checkJavaBackendStatus();
  }

  public static getInstance(): KinshipPlatformFacade {
    if (!KinshipPlatformFacade.instance) {
      KinshipPlatformFacade.instance = new KinshipPlatformFacade();
    }
    return KinshipPlatformFacade.instance;
  }

  public async checkJavaBackendStatus(): Promise<boolean> {
    try {
      const res = await fetch(`${JAVA_BACKEND_URL}/system/oop-metrics`, { signal: AbortSignal.timeout(1500) });
      if (res.ok) {
        this.isJavaBackendLive = true;
        console.log("✅ [Kinship] Live Java JDBC Server detected on port 8080!");
        return true;
      }
    } catch {
      this.isJavaBackendLive = false;
    }
    return false;
  }

  public isBackendLive(): boolean {
    return this.isJavaBackendLive;
  }

  public async getFeedPostsAsync(): Promise<any[]> {
    try {
      const res = await fetch(`${JAVA_BACKEND_URL}/feed`);
      if (res.ok) {
        const data = await res.json();
        this.isJavaBackendLive = true;
        return data;
      }
    } catch (err) {
      this.isJavaBackendLive = false;
      console.error("Backend not reachable", err);
    }
    return [];
  }

  public async getCreatorsAsync(): Promise<any[]> {
    try {
      const res = await fetch(`${JAVA_BACKEND_URL}/creators`);
      if (res.ok) {
        return await res.json();
      }
    } catch {}
    return [];
  }

  public async getOpportunitiesAsync(): Promise<any[]> {
    try {
      const res = await fetch(`${JAVA_BACKEND_URL}/opportunities`);
      if (res.ok) {
        return await res.json();
      }
    } catch {}
    return [];
  }

  public async createPost(content: string, type: "image" | "video" | "collab" = "image", mediaUrl: string): Promise<any> {
      try {
          const res = await fetch(`${JAVA_BACKEND_URL}/feed/create`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ content, type, mediaUrl }),
          });
          if (res.ok) {
              return await res.json();
          }
      } catch (err) {
          console.error("Failed to create post", err);
      }
      return null;
  }

  public async likePost(id: number): Promise<boolean> {
      try {
          const res = await fetch(`${JAVA_BACKEND_URL}/feed/like?id=${id}`, { method: "POST" });
          return res.ok;
      } catch (err) {
          console.error("Failed to like post", err);
          return false;
      }
  }

  public async followUser(id: number): Promise<boolean> {
      try {
          const res = await fetch(`${JAVA_BACKEND_URL}/creators/follow?id=${id}`, { method: "POST" });
          return res.ok;
      } catch (err) {
          console.error("Failed to follow user", err);
          return false;
      }
  }

  public async updateProfile(id: number, name: string, bio: string): Promise<boolean> {
      try {
          const res = await fetch(`${JAVA_BACKEND_URL}/creators/update`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ id, name, bio })
          });
          return res.ok;
      } catch (err) {
          console.error("Failed to update profile", err);
          return false;
      }
  }
}
