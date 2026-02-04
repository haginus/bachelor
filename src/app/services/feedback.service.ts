import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "../../environments/environment";

@Injectable({
  providedIn: 'any'
})
export class FeedbackService {

  constructor(private readonly http: HttpClient) {}

  private readonly baseUrl = `${environment.apiUrl}/feedback`;

  sendFeedback(feedback: FeedbackDto) {
    return this.http.post<void>(this.baseUrl, feedback);
  }

}

interface FeedbackDto {
  type: string;
  description: string;
  replyToEmail: string;
  user?: { firstName: string; lastName: string; };
}
