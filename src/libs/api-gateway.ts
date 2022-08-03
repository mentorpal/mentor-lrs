export const formatJSONResponse = (response, statusCode=200) => {
  return {
    statusCode: statusCode,
    body: JSON.stringify(response)
  }
}
