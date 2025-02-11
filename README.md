# drip. Fertility Converter
An open-source web tool for converting formatted fertility data of common fertility tracking apps to the drip.app format.

## Currently Supported Apps
- Premom
- Read Your Body
- Ovagraph

## Contributing

There are lots of fertility apps out there and unfortunately I can't do them all. If you don't see one you use or want supported 
feel free to contribute.

### Process
- Fork the project and clone to your local machine to make changes
- Create a new branch with the name of your change (e.g. some_app_mapper_support)
- Make changes
- Create a pull request

### What to Contribute
- Create a file under the `mappers` directory named after the app you're adding support for
- Add your app name to the `APP_NAME` constant in `index.js`
- If an export resource exists to your app, add it to the `HELP_LINK_MAP` in `index.js`. Otherwise, omit it.
- Add a switch case for the new `APP_NAME` you've created under `mapToDripFormat` function in `index.js` and have it return the value of your mapper
- Add the `APP_NAME` value as an `<option>` under the `<select>` element in `index.html`
- Add tests under the `tests` directory
- Add any generic functionality/variables to the utils/constants files.

I added some comments around the code under "DEV_NOTE". Do a search in whatever IDE you use to check those out.
I also added a template file under `template.js` that you can use if you prefer.

### Tests
Mapping from one data format to another can be a tedious task and isn't very intuitive to manually verify. Be sure to create
tests around your mappings that cover any edge cases or data that requires processing. You also must verify that it can be imported successfully into the drip. app.
