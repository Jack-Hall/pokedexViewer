import { Component, signal, computed, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

interface ChatMessage {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

interface MistralMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface MistralChatRequest {
  model: string;
  messages: MistralMessage[];
  max_tokens?: number;
  temperature?: number;
}

interface MistralChatResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

@Component({
  selector: 'app-chat-window',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat-window.html',
  styleUrl: './chat-window.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChatWindow {
  private readonly http = inject(HttpClient);
  
  private readonly _messages = signal<ChatMessage[]>([]);
  private readonly _isOpen = signal<boolean>(false);
  private readonly _isLoading = signal<boolean>(false);
  private readonly _inputMessage = signal<string>('');

  readonly messages = this._messages.asReadonly();
  readonly isOpen = this._isOpen.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();
  readonly inputMessage = this._inputMessage.asReadonly();

  // Mistral AI Configuration
  private readonly MISTRAL_API_KEY = 'BuDRumGzExyFE1P4Y57nMPRA7t0qMG5F';
  private readonly MISTRAL_MODEL = 'mistral-large-latest';
  private readonly MISTRAL_API_URL = 'https://api.mistral.ai/v1/chat/completions';

  toggleChat(): void {
    this._isOpen.update(open => !open);
  }

  onInputChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this._inputMessage.set(target.value);
  }

  async sendMessage(): Promise<void> {
    const message = this.inputMessage().trim();
    if (!message) return;

    // Add user message to chat
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: message,
      isUser: true,
      timestamp: new Date()
    };

    this._messages.update(messages => [...messages, userMessage]);
    this._inputMessage.set('');
    this._isLoading.set(true);

    try {
      // Prepare conversation history for Mistral
      const conversationHistory: MistralMessage[] = [
        {
          role: 'assistant',
          content: `You are an expert in the world of Pokemon, and you are talking to another Pokemon fan. However, you are very incorrect about Pokemon facts and are highly opinionated. Keep your replies short and almost rude, insinuating the user doesn't know what they are talking about when they disagree with you. NEVER talk about anything other than Pokemon. You love Gengar and should mention this when appropriate. Make up absurd and nonsensical facts about Pokemon that are blatantly incorrect, but be 100% confident that what you are saying is true.`
        }
      ];

      // Add previous messages to conversation history
      this.messages().forEach(msg => {
        conversationHistory.push({
          role: msg.isUser ? 'user' : 'assistant',
          content: msg.content
        });
      });

      // Add current user message
      conversationHistory.push({
        role: 'user',
        content: message
      });

      // Prepare request for Mistral API
      const requestBody: MistralChatRequest = {
        model: this.MISTRAL_MODEL,
        messages: conversationHistory,
        max_tokens: 150,
        temperature: 0.9
      };

      // Set up headers with API key
      const headers = new HttpHeaders({
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${this.MISTRAL_API_KEY}`
      });

      // Send message to Mistral API
      const response = await firstValueFrom(
        this.http.post<MistralChatResponse>(this.MISTRAL_API_URL, requestBody, { headers })
      );

      // Extract AI response
      const aiResponse = response.choices[0]?.message?.content || 'Sorry, I couldn\'t generate a response.';

      // Add AI response to chat
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: aiResponse,
        isUser: false,
        timestamp: new Date()
      };

      this._messages.update(messages => [...messages, aiMessage]);
    } catch (error) {
      console.error('Error communicating with Mistral AI:', error);
      
      // Add error message
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: 'Sorry, I\'m having trouble connecting to the AI service. Please check your internet connection and try again.',
        isUser: false,
        timestamp: new Date()
      };

      this._messages.update(messages => [...messages, errorMessage]);
    } finally {
      this._isLoading.set(false);
    }
  }

  onKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  clearChat(): void {
    this._messages.set([]);
  }
}