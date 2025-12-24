import { AppShell, Container, Stack, Center, Text } from "@mantine/core";
import { DownloadForm, WindowControls, TabBar } from "./components";
import { useDownloader } from "./hooks/useDownloader";
import { useState } from "react";

function App() {
  const [activeTab, setActiveTab] = useState('downloader');
  const {
    url,
    proxy,
    cookies,
    downloadPath,
    isDownloading,
    setUrl,
    setProxy,
    setCookies,
    setDownloadPath,
    handleDownload,
    handleSelectFolder,
  } = useDownloader();

  return (
    <AppShell padding="0">
      <WindowControls />

      <Container fluid p="0" style={{ paddingTop: 40, height: '100vh', display: 'flex', flexDirection: 'column' }}>
        {activeTab === 'downloader' ? (
          <Stack gap="0" style={{ flex: 1, padding: 0 }}>
            <DownloadForm
              url={url}
              proxy={proxy}
              cookies={cookies}
              downloadPath={downloadPath}
              isDownloading={isDownloading}
              onUrlChange={setUrl}
              onProxyChange={setProxy}
              onCookiesChange={setCookies}
              onDownloadPathChange={setDownloadPath}
              onBrowse={handleSelectFolder}
              onDownload={handleDownload}
            />
          </Stack>
        ) : (
          <Center style={{ flex: 1 }}>
            <Text c="dimmed" size="lg">
              {activeTab === 'extractor' && 'ID Extractor'}
              {activeTab === 'tracker' && 'Live Tracker'}
              {activeTab === 'proxies' && 'Proxies'}
              {' '}module coming soon
            </Text>
          </Center>
        )}
      </Container>

      <TabBar activeTab={activeTab} onTabChange={setActiveTab} />
    </AppShell>
  );
}

export default App;
