# Generating Media Assets

## Install dependencies

- <https://github.com/asciinema/asciinema>
- <https://github.com/asciinema/asciicast2gif>

## Record a new asciicast

```console
$ asciinema rec -i .3 -c bash media/kairos.cast
  # inside recording sesson
  $ node kairos.js
```

## Convert your asciicast to gif

```console
asciicast2gif -t tango -S 3 media/kairos.cast media/demo.gif
```
