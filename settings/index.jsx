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
        <Text align="center">or</Text>
        <TextInput
          label="User ID"
          title="userId"
          settingsKey="userId"
        />
        <TextInput
          label="API Token"
          title="apiToken"
          settingsKey="apiToken"
          type="password"
        />
      </Section>
    </Page>
  );
}

registerSettingsPage(mySettings);
