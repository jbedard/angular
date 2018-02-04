/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AsyncTestCompleter, beforeEach, describe, expect, inject, it} from '@angular/core/testing/src/testing_internal';
import {filter} from 'rxjs/operators';
import {EventEmitter} from '../src/event_emitter';
import {Subject} from 'rxjs/Subject';

{
  describe('EventEmitter', () => {
    let emitter: EventEmitter<any>;

    beforeEach(() => { emitter = new EventEmitter(); });

    it('should call the next callback',
       inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
         emitter.subscribe({
           next: (value: any) => {
             expect(value).toEqual(99);
             async.done();
           }
         });
         emitter.emit(99);
       }));

    it('should call the throw callback',
       inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
         emitter.subscribe({
           next: () => {},
           error: (error: any) => {
             expect(error).toEqual('Boom');
             async.done();
           }
         });
         emitter.error('Boom');
       }));

    it('should work when no throw callback is provided',
       inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
         emitter.subscribe({next: () => {}, error: (_: any) => { async.done(); }});
         emitter.error('Boom');
       }));

    it('should call the return callback',
       inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
         emitter.subscribe(
             {next: () => {}, error: (_: any) => {}, complete: () => { async.done(); }});
         emitter.complete();
       }));

    it('should subscribe to the wrapper synchronously', () => {
      let called = false;
      emitter.subscribe({next: (value: any) => { called = true; }});
      emitter.emit(99);

      expect(called).toBe(true);
    });

    it('delivers next and error events synchronously',
       inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
         const log: any[] /** TODO #9100 */ = [];

         emitter.subscribe({
           next: (x: any) => {
             log.push(x);
             expect(log).toEqual([1, 2]);
           },
           error: (err: any) => {
             log.push(err);
             expect(log).toEqual([1, 2, 3, 4]);
             async.done();
           }
         });
         log.push(1);
         emitter.emit(2);
         log.push(3);
         emitter.error(4);
         log.push(5);
       }));

    it('delivers next and complete events synchronously', () => {
      const log: any[] /** TODO #9100 */ = [];

      emitter.subscribe({
        next: (x: any) => {
          log.push(x);
          expect(log).toEqual([1, 2]);
        },
        error: null,
        complete: () => {
          log.push(4);
          expect(log).toEqual([1, 2, 3, 4]);
        }
      });
      log.push(1);
      emitter.emit(2);
      log.push(3);
      emitter.complete();
      log.push(5);
      expect(log).toEqual([1, 2, 3, 4, 5]);
    });

    it('delivers events asynchronously when forced to async mode',
       inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
         const e = new EventEmitter(true);
         const log: any[] /** TODO #9100 */ = [];
         e.subscribe((x: any) => {
           log.push(x);
           expect(log).toEqual([1, 3, 2]);
           async.done();
         });
         log.push(1);
         e.emit(2);
         log.push(3);

       }));

    it('delivers complete asynchronously when forced to async mode',
      inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
        const e = new EventEmitter(true);
        const log: any[] /** TODO #9100 */ = [];
        e.subscribe((x: any) => {
          log.push(x);
        }, undefined, () => {
          log.push(4);
          expect(log).toEqual([1, 3, 5, 2, 4]);
          async.done();
        });
        log.push(1);
        e.emit(2);
        log.push(3);
        e.complete();
        log.push(5);

      }));

    it('delivers errors asynchronously when forced to async mode',
      inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
        const e = new EventEmitter(true);
        const log: any[] /** TODO #9100 */ = [];
        e.subscribe((x: any) => {
          log.push(x);
        }, (e: any) => {
          log.push(e);
          expect(log).toEqual([1, 3, 5, 2, 4]);
          async.done();
        });
        log.push(1);
        e.emit(2);
        log.push(3);
        e.error(4);
        log.push(5);

      }));

    it('reports whether it has subscribers', () => {
      const e = new EventEmitter(false);
      expect(e.observers.length > 0).toBe(false);
      e.subscribe({next: () => {}});
      expect(e.observers.length > 0).toBe(true);
    });

    it('should invoke Subscription dispose method after .subscribe().unsubscribe()', () => {
      const ee = new EventEmitter();
      const sub = ee.subscribe();
      const dispose = jasmine.createSpy("dispose");
      sub.add(dispose);
      sub.unsubscribe();
      expect(dispose).toHaveBeenCalled();
    });

    it('should invoke Subscription dispose method after .subscribe().pipe(op).unsubscribe()', () => {
      const ee = new EventEmitter();
      const sub = ee.pipe(filter(() => true)).subscribe();
      const dispose = jasmine.createSpy("dispose");
      sub.add(dispose);
      sub.unsubscribe();
      expect(dispose).toHaveBeenCalled();
    });

    it('should have no observers after .subscribe().unsubscribe()', () => {
      const ee = new EventEmitter();
      ee.subscribe().unsubscribe();
      expect(ee.observers.length).toBe(0);
    });

    it('should have no observers after .subscribe(Subject).unsubscribe()', () => {
      const ee = new EventEmitter();
      ee.subscribe(new Subject()).unsubscribe();
      expect(ee.observers.length).toBe(0);
    });

    it('should have no observers after .pipe().subscribe().unsubscribe()', () => {
      const ee = new EventEmitter();
      ee.pipe().subscribe().unsubscribe();
      expect(ee.observers.length).toBe(0);
    });

    it('should have no observers after .pipe(op).subscribe().unsubscribe()', () => {
      const ee = new EventEmitter();
      ee.pipe(filter(() => true)).subscribe().unsubscribe();
      expect(ee.observers.length).toBe(0);
    });

    it('should have no observers after .subscribe() + .complete()', () => {
      const ee = new EventEmitter();
      ee.subscribe();
      ee.complete();
      expect(ee.observers.length).toBe(0);
    });

    it('should have no observers after .subscribe(Subject) + .complete()', () => {
      const ee = new EventEmitter();
      ee.subscribe(new Subject());
      ee.complete();
      expect(ee.observers.length).toBe(0);
    });

    it('should have no observers after .pipe().subscribe() + .error()', () => {
      const ee = new EventEmitter();
      ee.pipe().subscribe();
      ee.complete();
      expect(ee.observers.length).toBe(0);
    });

    it('should have no observers after .pipe(op).subscribe() + .error()', () => {
      const ee = new EventEmitter();
      ee.pipe(filter(() => true)).subscribe();
      ee.complete();
      expect(ee.observers.length).toBe(0);
    });

    it('should have no observers after .subscribe() + .error()',
      inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
        const ee = new EventEmitter();
        ee.subscribe(undefined, () => async.done());
        ee.error("err");
        expect(ee.observers.length).toBe(0);
      }));

    it('should have no observers after .subscribe(Subject) + .error()',
      inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
        const ee = new EventEmitter();
        const s = new Subject();
        s.subscribe(undefined, () => async.done());
        ee.subscribe(s);
        ee.error("err");
        expect(ee.observers.length).toBe(0);
      }));

    it('should have no observers after .pipe().subscribe() + .error()',
      inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
        const ee = new EventEmitter();
        ee.pipe().subscribe(undefined, () => async.done());
        ee.error("err");
        expect(ee.observers.length).toBe(0);
      }));

    it('should have no observers after .pipe(op).subscribe() + .error()',
      inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
        const ee = new EventEmitter();
        ee.pipe(filter(() => true)).subscribe(undefined, () => async.done());
        ee.error("err");
        expect(ee.observers.length).toBe(0);
      }));

    // TODO: vsavkin: add tests cases
    // should call dispose on the subscription if generator returns {done:true}
    // should call dispose on the subscription on throw
    // should call dispose on the subscription on return
  });
}
