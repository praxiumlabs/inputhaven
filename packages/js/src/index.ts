export interface InputHavenOptions {
  accessKey: string;
  endpoint?: string;
}

export interface SubmitOptions {
  data: Record<string, string>;
  redirect?: string;
  honeypotField?: string;
}

export interface SubmitResult {
  success: boolean;
  submissionId?: string;
  error?: string;
}

export class InputHaven {
  private accessKey: string;
  private endpoint: string;

  constructor(options: InputHavenOptions) {
    this.accessKey = options.accessKey;
    this.endpoint = options.endpoint || "https://inputhaven.com/api/v1/submit";
  }

  async submit(options: SubmitOptions): Promise<SubmitResult> {
    const body: Record<string, string> = {
      _form_id: this.accessKey,
      ...options.data,
    };

    if (options.redirect) {
      body._redirect = options.redirect;
    }

    try {
      const response = await fetch(this.endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(body),
      });

      const result = await response.json();

      if (!response.ok) {
        return { success: false, error: result.error || "Submission failed" };
      }

      return { success: true, submissionId: result.submissionId };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Network error",
      };
    }
  }

  async submitForm(form: HTMLFormElement): Promise<SubmitResult> {
    const formData = new FormData(form);
    const data: Record<string, string> = {};

    formData.forEach((value, key) => {
      if (typeof value === "string" && !key.startsWith("_")) {
        data[key] = value;
      }
    });

    return this.submit({ data });
  }
}

export default InputHaven;
