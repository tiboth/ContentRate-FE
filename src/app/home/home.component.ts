import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {UtilService} from '../shared/service/util.service';
import {first} from 'rxjs/operators';
import {AnalysisService} from '../shared/service/analysis.service';
import {interval, Subscription} from 'rxjs';
import {JobStatus} from '../shared/model/job.status';
import {Job} from '../shared/model/job';
import Timeout = NodeJS.Timeout;

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  constructor(
    private formBuilder: FormBuilder,
    private analysisService: AnalysisService,
    private utilService: UtilService
  ) {
  }

  // convenience getter for easy access to form fields
  get f() {
    return this.analysisForm.controls;
  }

  analysisForm: FormGroup;
  step = 0;
  loading = false;
  submitted = false;
  analysisResult: Job;
  hideResult = true;

  private static mapStep(step: JobStatus): number {
    console.log('status:' + step.toString());
    console.log('status:' + step);
    switch (step.toString()) {
      case JobStatus.CONFIRMED.toString():
        console.log('returning 1');
        return 1;
      case JobStatus.IN_QUEUE.toString():
        console.log('returning 2');
        return 2;
      case JobStatus.RECEIVED.toString():
      case JobStatus.URL_SCRAPING_STARTED.toString():
      case JobStatus.GOOGLE_SCRAPING_STARTED.toString():
        console.log('returning 3');
        return 3;
      case JobStatus.ANALYSIS_STARTED.toString():
      case JobStatus.SAVING.toString():
        console.log('returning 4');
        return 4;
      case JobStatus.COMPLETED.toString():
        console.log('returning 5');
        return 5;
      default:
        return 1;

    }
  }

  ngOnInit(): void {
    this.analysisForm = this.formBuilder.group({
      url: ['', Validators.required],
      query: ['', Validators.required]
    });
  }

  onSubmit() {
    this.step = 0;
    this.submitted = true;

    // stop here if form is invalid
    if (this.analysisForm.invalid) {
      return;
    }

    this.loading = true;

    const subscription = this.analysisService.analyse(this.f.url.value, this.f.query.value)
      .pipe(first())
      .subscribe(
        job => {
          localStorage.setItem('jobId', job.id.toString());
          this.step = 1;
          // tslint:disable-next-line:max-line-length
          const timeout = setTimeout(() => {
            statusSubscription.unsubscribe();
            this.utilService.createToastrError('Server didn\'t respond. Please try again.', 'ERROR');
            this.step = 0;
            this.stopAnalysis(timeout);
          }, 155000);
          const repeat = interval(3000);
          const statusSubscription = repeat.subscribe(
            () => this.analysisService.getResult(job.id)
              .pipe(first())
              .subscribe(
                update => this.updateStep(statusSubscription, timeout, update.job_status, job.id)
              )
          );
        },
        error => {
          this.loading = false;
        });

  }

  private updateStep(subscription: Subscription, timeout: Timeout, receivedStep: JobStatus, jobId: number) {
    const step = HomeComponent.mapStep(receivedStep);
    console.log('step:' + step);
    if (step < 5) {
      this.step = step;
    } else {
      this.utilService.createToastrSuccess('The server completed the analysis', '');
      this.step = step;
      subscription.unsubscribe();
      this.stopAnalysis(timeout);
      this.analysisService.getResult(jobId)
        .pipe(first())
        .subscribe(
          result => {
            console.log(result);
            this.analysisResult = result;
            this.hideResult = false;
          });
    }
  }

  private stopAnalysis(timeout: Timeout) {
    this.loading = false;
    clearTimeout(timeout);
  }


}
