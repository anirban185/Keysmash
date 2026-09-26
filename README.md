# Keysmash

A typing speed tester, made for Hack Club's Waffles YSWS.

## What it dose

You pick a length (short/medium/long), start typing, and it tracks your WPM, Accuracy, and errors. When you'ur done it saves the result, and there's a second page where you can look back at all your past attempts, fillter them by mode, and see a little chart of your WPM over time.

## How it works

The typing part works by splitting the target text into individual letters, each one wrapped in it's own `<span>`. Every time you type. it compares what you typed against  the target letter and colors each span correct/wrong/current. That's also how the highlighted "next letter" thing works, it's just whichever span matches your current typed length.

WPM is calculated using the standerd formula: correct characters divided by 5 (average word length), divided by minutes elapsed. Accuracy is just correct characters over total typed characters, as percentage. Both update live every keystrok.

The timer runs on `setInterval`, ticking down every secound and ending the test when it hits zero (or earlier if you finish the whole text first).

For saving history, since this has to be a static site with no backend, everything gets stored in the browser's `localStorage`. Each finished test gets pushed into an array as an object(date, mode, wpm, accuracy, time taken, which letter you missed most) and the whole array gets saved as a JSON string. The analysis page just reads that  same array back out, parses it, and filters/sums it  depending on what drop down you've got selacted.

The wpm-over-time chart isn't any chart library, it's just a row of divs with their hieght set based on wpm relativ to your highest score.

## colors

I am realy bad at colors, so i picked a color palette from W3Schools.
