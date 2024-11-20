import {Component, OnInit, ViewChild} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Review} from "../../entities/Review";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {Router} from "@angular/router";

@Component({
  selector: 'app-reviews',
  templateUrl: './reviews.component.html',
  styleUrls: ['./reviews.component.scss']
})
export class ReviewsComponent implements OnInit {

  @ViewChild('stars') stars: HTMLElement | undefined;

  reviews: Review[] = [];
  average: number|null = null;
  reviewForm: FormGroup;
  token: string|null = null;
  isLogged = false;

  constructor(private http: HttpClient, private router: Router) {
    this.token = localStorage.getItem('user') ?? null;
    this.reviewForm = new FormGroup({
      title: new FormControl('', [Validators.required]),
      comment: new FormControl('', [Validators.required]),
      rating: new FormControl('', [Validators.required, Validators.min(1), Validators.max(5)])
    });
  }

  ngOnInit(): void {
    this.updateReviews();
    this.isLogged = (localStorage.getItem('user') ?? null) !== null;
  }

  postReview(): void {
    this.reviewForm.markAllAsTouched();
    if(this.reviewForm.valid) {
      this.http.post('http://localhost:8081/reviews', this.reviewForm.value, {
        headers: {
          Authorization: 'Bearer ' + localStorage.getItem('user')
        }
      }).subscribe(_ => {
        this.updateReviews();
      }, response => {
        if(response.status === 401) {
          localStorage.removeItem('user');
          this.router.navigate(['/login']);
        }
      })
    }
  }

  updateReviews(): void {
    this.reviews = [];
    this.http.get('http://localhost:8081/reviews').subscribe((reviews: any) => {
      this.average = 0;
      reviews.forEach((rawReview: object) => {
        const review = new Review(rawReview);
        this.reviews.push(review);
        // @ts-ignore
        this.average += review.rating
      });
      // @ts-ignore
      this.average /= this.reviews.length;
    });
  }

  highlightStar(rating: number): void {
    for(let i = 1 ; i <= 5 ; i++) {
      // @ts-ignore
      this.stars.nativeElement.querySelector('img:nth-child(' + i + ')').src =
          (rating >= i)
              ? 'assets/images/star-full.png'
              : 'assets/images/star-empty.png';
    }
  }

  stopHighlight(): void {
    for(let i = 1 ; i <= 5 ; i++) {
      // @ts-ignore
      this.stars.nativeElement.querySelector('img:nth-child(' + i + ')').src =
          (this.reviewForm.get('rating')?.value >= i)
              ? 'assets/images/star-full.png'
              : 'assets/images/star-empty.png';
    }
  }

  chooseRating(rating: number): void {
    this.reviewForm.get('rating')?.setValue(rating);
    for(let i = 1 ; i <= 5 ; i++) {
        // @ts-ignore
        this.stars.nativeElement.querySelector('img:nth-child(' + i + ')').src =
            (rating >= i)
                ? 'assets/images/star-full.png'
                : 'assets/images/star-empty.png';
    }
  }

}
