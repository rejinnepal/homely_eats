import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateDinnerComponent } from './create-dinner.component';

describe('CreateDinnerComponent', () => {
  let component: CreateDinnerComponent;
  let fixture: ComponentFixture<CreateDinnerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateDinnerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateDinnerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
