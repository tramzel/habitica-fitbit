console.log("Opening Habatica Settings page");

function mySettings(props) {
  return (
    <Page>
      <Section
        title={<Text bold align="center">Credentials</Text>}>
        <TextInput
          label="Username"
          title="username"
          settingsKey="username"
        />
        <TextInput
          label="Password"
          title="password"
          settingsKey="password"
          type="password"
        />
      </Section>
    </Page>
  );
}

registerSettingsPage(mySettings);
