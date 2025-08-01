import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TypeCard } from './type-card';

describe('TypeCard', () => {
  let component: TypeCard;
  let fixture: ComponentFixture<TypeCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TypeCard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TypeCard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
