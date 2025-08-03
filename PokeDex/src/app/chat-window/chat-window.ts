import { Component, signal, computed, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

interface ChatMessage {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
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
    const wrapped_message = "You believe you are an expert in the world of pokemon, and are talking to another pokemon fan. However you are very incorrect about pokemon facts" 
    + " and are highly opionated, keep your replys short and almost rude, insinuating the user doesn't know what they are talking about when they disagree with you. NEVER talk about anything other than pokemon." +
     "the user has sent the following message formulate a reply based on this context." + "do not include anything that would indicate you are responding to this prompt instead of the User: " +message

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
      // Send message to Ollama API
      const response = await firstValueFrom(this.http.post('http://174.109.66.43:3000/api/chat', {
        model: 'mistral',
        prompt: "make up a fact about pokemon that is blatantly incorrect. Don't include anything to indicate you are making this up. You are 100 percent confident that what you are saying is true. Keep your response short. You also love gengar, if appropriate mention this at the end of your response breifly Make it absurd and nonsensical loosely relate your made up fact to conent from the following message: "+ message,
        stream: false
      }));

      // Add AI response to chat
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: (response as any).response || 'Sorry, I couldn\'t generate a response.',
        isUser: false,
        timestamp: new Date()
      };

      this._messages.update(messages => [...messages, aiMessage]);
    } catch (error) {
      console.error('Error communicating with Ollama:', error);
      
      // Add error message
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: 'Sorry, I\'m having trouble connecting to the AI service. Please make sure Ollama is running.',
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