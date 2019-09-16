git ls-files | grep -P '(png|jpg|svg|ico)' --invert-match | xargs wc -l

