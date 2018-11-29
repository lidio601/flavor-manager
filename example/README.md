
# How to run

Open the htdocs/index.html in your browser.

## Apply a flavor

In a terminal:

```
$ cd example/

$ flavor list
Available flavors:
0) apple
1) window

$ flavor apply apple
Switching to flavor: apple
2 changes to apply
* create .rollback/
* create htdocs/assets/images/
* copy htdocs/assets/images/apple.jpg
* backup current htdocs/index.html
* copy htdocs/index.html
* writing file .rollback/rollback.json
```

Hit refresh in your browser to see the apple flavor applied.

## Rollback to unflavored one

To rollback simply type in a terminal:

```
$ cd example/

$ flavor rollback
Rolling back from flavor: apple
[2] files to remove
[1] folders to remove
[1] files to restore
* removing flavor htdocs/assets/images/apple.jpg
* removing flavor htdocs/index.html
* removing flavor htdocs/assets/
* restoring original htdocs/index.html
* removing rollback file
```
