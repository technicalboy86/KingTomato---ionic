angular.module('kingtomato.filters', [])

/*Usage:
{{some_text | cut:true:100:' ...'}}

Options:

wordwise (boolean) - if true, cut only by words bounds,
max (integer) - max length of the text, cut to this number of chars,
tail (string, default: ' …') - add this string to the input string if the string was cut.
*/
.filter('cut', function () {
    return function (value, wordwise, max, tail) {
        if (!value) return '';

        max = parseInt(max, 10);
        if (!max) return value;
        if (value.length <= max) return value;

        value = value.substr(0, max);
        if (wordwise) {
            var lastspace = value.lastIndexOf(' ');
            if (lastspace != -1) {
                value = value.substr(0, lastspace);
            }
        }

        return value + (tail || ' …');
    };
})
.filter('htmlToPlaintext', function() {
    return function(text) {
      return String(text).replace(/<[^>]+>/gm, '');
    }
})

.directive('errSrc', function() {
  return {
    link: function(scope, element, attrs) {
      //alert(attrs.ngSrc + '?decache=' + Math.random());

      element.bind('error', function() {
        /*console.log(element);
        scope.$apply(function(){
          element.attr('src', attrs.ngSrc);
        });
        //var intervalID;

        /*intervalID = setInterval(function(){
          element.attr('src', attrs.ngSrc);
        },200);*/

        //element.attr('src', attrs.errSrc);
        //element.attr('src', attrs.ngSrc + '?decache=' + Math.random());
      });
    }
  }
})

.filter("timeago", function () {
    //time: the time
    //local: compared to what time? default: now
    //raw: wheter you want in a format of "5 minutes ago", or "5 minutes"
    return function (time, local, raw) {
        if (!time) return "never";
 
        if (!local) {
            (local = Date.now())
        }
 
        if (angular.isDate(time)) {
            time = time.getTime();
        } else if (typeof time === "string") {
            time = new Date(time).getTime();
        }
 
        if (angular.isDate(local)) {
            local = local.getTime();
        }else if (typeof local === "string") {
            local = new Date(local).getTime();
        }
 
        if (typeof time !== 'number' || typeof local !== 'number') {
            return;
        }
 
        var
            offset = Math.abs((local - time) / 1000),
            span = [],
            MINUTE = 60,
            HOUR = 3600,
            DAY = 86400,
            WEEK = 604800,
            MONTH = 2629744,
            YEAR = 31556926,
            DECADE = 315569260;
 
        if (offset <= MINUTE)              span = [ '', raw ? 'now' : 'less than a minute' ];
        else if (offset < (MINUTE * 60))   span = [ Math.round(Math.abs(offset / MINUTE)), 'min' ];
        else if (offset < (HOUR * 24))     span = [ Math.round(Math.abs(offset / HOUR)), 'hr' ];
        else if (offset < (DAY * 7))       span = [ Math.round(Math.abs(offset / DAY)), 'day' ];
        else if (offset < (WEEK * 52))     span = [ Math.round(Math.abs(offset / WEEK)), 'week' ];
        else if (offset < (YEAR * 10))     span = [ Math.round(Math.abs(offset / YEAR)), 'year' ];
        else if (offset < (DECADE * 100))  span = [ Math.round(Math.abs(offset / DECADE)), 'decade' ];
        else                               span = [ '', 'a long time' ];
 
        span[1] += (span[0] === 0 || span[0] > 1) ? 's' : '';
        span = span.join(' ');
 
        if (raw === true) {
            return span;
        }
        return (time <= local) ? span + ' ago' : 'in ' + span;
    }
});