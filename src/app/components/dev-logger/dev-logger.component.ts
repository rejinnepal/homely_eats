import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LoggerService, LogLevel } from '../../services/logger.service';

@Component({
  selector: 'app-dev-logger',
  templateUrl: './dev-logger.component.html',
  styleUrls: ['./dev-logger.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class DevLoggerComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('logContainer') private logContainer!: ElementRef;
  
  logs: string[] = [];
  autoScroll: boolean = true;
  showDebug: boolean = true;
  showInfo: boolean = true;
  showWarn: boolean = true;
  showError: boolean = true;
  searchText: string = '';
  private logUpdateInterval: any;
  
  constructor(private logger: LoggerService) {}
  
  ngOnInit(): void {
    // Update logs every second
    this.logUpdateInterval = setInterval(() => {
      this.updateLogs();
    }, 1000);
  }
  
  ngOnDestroy(): void {
    if (this.logUpdateInterval) {
      clearInterval(this.logUpdateInterval);
    }
  }
  
  ngAfterViewChecked(): void {
    if (this.autoScroll) {
      this.scrollToBottom();
    }
  }
  
  updateLogs(): void {
    this.logs = this.logger.getLogs();
  }
  
  clearLogs(): void {
    this.logger.clearLogs();
    this.updateLogs();
  }
  
  exportLogs(): void {
    this.logger.exportLogs();
  }
  
  setLogLevel(level: LogLevel): void {
    this.logger.setLogLevel(level);
  }
  
  toggleAutoScroll(): void {
    this.autoScroll = !this.autoScroll;
    if (this.autoScroll) {
      this.scrollToBottom();
    }
  }
  
  private scrollToBottom(): void {
    try {
      this.logContainer.nativeElement.scrollTop = this.logContainer.nativeElement.scrollHeight;
    } catch (err) {
      console.error('Error scrolling to bottom:', err);
    }
  }
  
  getFilteredLogs(): string[] {
    return this.logs.filter(log => {
      // Apply search filter
      if (this.searchText && !log.toLowerCase().includes(this.searchText.toLowerCase())) {
        return false;
      }
      
      // Apply log level filters
      if (log.includes('[DEBUG]') && !this.showDebug) return false;
      if (log.includes('[INFO]') && !this.showInfo) return false;
      if (log.includes('[WARN]') && !this.showWarn) return false;
      if (log.includes('[ERROR]') && !this.showError) return false;
      
      return true;
    });
  }
  
  getLogClass(log: string): string {
    if (log.includes('[DEBUG]')) return 'log-debug';
    if (log.includes('[INFO]')) return 'log-info';
    if (log.includes('[WARN]')) return 'log-warn';
    if (log.includes('[ERROR]')) return 'log-error';
    return '';
  }
} 