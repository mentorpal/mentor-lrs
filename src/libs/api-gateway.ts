export const formatJSONResponse = (response: Record<string, unknown>, statusCode=200) => {
  return {
    statusCode: statusCode,
    body: JSON.stringify(response)
  }
}
