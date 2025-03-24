<tr>
                        <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                          Nu există coduri promoționale
                        </td>
                      </tr>
                    ) : (
                      promoCodes.map((code) => {
                        const isExpired = code.expires_at && new Date(code.expires_at) < new Date();
                        const isFullyUsed = code.max_uses && code.current_uses >= code.max_uses;
                        
                        return (
                          <tr key={code.id} className={isExpired || isFullyUsed ? 'bg-gray-50' : ''}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{code.code}</div>
                              <div className="text-xs text-gray-500">
                                Creat: {new Date(code.created_at).toLocaleDateString()}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                <Crown className="h-3 w-3 mr-1" />
                                {getPeriodLabel(code.premium_period)}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <div className="text-sm text-gray-900">
                                {code.current_uses} / {code.max_uses || '∞'}
                              </div>
                              {isFullyUsed && (
                                <div className="text-xs text-red-500">Utilizat complet</div>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {code.expires_at ? (
                                <div className="text-sm text-gray-900">
                                  {new Date(code.expires_at).toLocaleDateString()}
                                  {isExpired && (
                                    <span className="ml-2 text-xs text-red-500">Expirat</span>
                                  )}
                                </div>
                              ) : (
                                <span className="text-sm text-gray-500">Fără expirare</span>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <button
                                onClick={() => handleTogglePromoCodeStatus(code.id, code.is_active)}
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  code.is_active && !isExpired && !isFullyUsed
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-gray-100 text-gray-800'
                                }`}
                              >
                                {code.is_active && !isExpired && !isFullyUsed ? (
                                  <>
                                    <Check className="h-3 w-3 mr-1" />
                                    Activ
                                  </>
                                ) : (
                                  <>
                                    <X className="h-3 w-3 mr-1" />
                                    Inactiv
                                  </>
                                )}
                              </button>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <button
                                onClick={() => handleDeletePromoCode(code.id)}
                                className="text-red-600 hover:text-red-900"
                              >
                                <Trash2 className="h-5 w-5" />
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {selectedPhoto && (
          <PhotoModal
            photoUrl={selectedPhoto}
            onClose={() => setSelectedPhoto(null)}
          />
        )}

        {selectedProfile && (
          <PremiumModal
            profile={selectedProfile}
            isOpen={isPremiumModalOpen}
            onClose={() => {
              setIsPremiumModalOpen(false);
              setSelectedProfile(null);
            }}
            onActivate={(period) => handleActivatePremium(selectedProfile.id, period)}
            onDeactivate={() => handleDeactivatePremium(selectedProfile.id)}
          />
        )}

        <CreatePromoCodeModal
          isOpen={isPromoCodeModalOpen}
          onClose={() => setIsPromoCodeModalOpen(false)}
          onSave={handleCreatePromoCode}
        />
      </div>
    </div>
  );
};

export default Admin;